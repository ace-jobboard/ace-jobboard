import { SchoolKey, SourceKey, SCRAPING_CONFIG, FRENCH_REGIONS } from "@/config/scraping"
import { isValidJobPosting, normaliseCompany } from "./filters"
import { extractNiveau, extractContractType } from "./education"

export interface ProcessedJob {
  title: string
  company: string
  description: string
  location: string
  region: string
  filiere: string
  niveau: string
  contractType: string
  salary: string | null
  url: string
  source: string
  apifyActorId: string
  rawData: Record<string, unknown>
}

/**
 * Transforms raw Apify actor output into a standardised ProcessedJob.
 * Returns null if the job should be discarded.
 *
 * Field mappings per verified actor:
 *
 * harvestapi/linkedin-job-search
 *   title, companyName, location, descriptionHtml|description, jobUrl|url, contractType
 *
 * shahidirfan/Jungle-Job-Scraper (WTTJ)
 *   title, company{name}, location|city, description, url, contractType
 *
 * misceres/indeed-scraper
 *   positionName|title, company, location, description, url|jobUrl, salary
 */
export function processRawJob(
  raw: unknown,
  school: SchoolKey,
  source: SourceKey
): ProcessedJob | null {
  const item = raw as Record<string, unknown>

  const schoolConfig = SCRAPING_CONFIG[school]
  const sourceConfig = schoolConfig.sources[source]
  if (!sourceConfig) return null

  // ── Extract fields by source ──────────────────────────────────────
  let title = ""
  let company = ""
  let description = ""
  let location = ""
  let url = ""
  let salary: string | null = null

  if (source === "linkedin") {
    // harvestapi/linkedin-job-search output fields
    title       = str(item.title)
    company     = str(item.companyName ?? item.company)
    description = str(item.descriptionHtml ?? item.description ?? item.jobDescription)
    location    = str(item.location ?? item.jobLocation)
    url         = str(item.jobUrl ?? item.url)
    // salary not typically provided by LinkedIn scraper

  } else if (source === "wttj") {
    // shahidirfan/Jungle-Job-Scraper output fields
    title       = str(item.title ?? item.name)
    const companyObj = item.company as Record<string, unknown> | null
    company     = str(companyObj?.name ?? item.company)
    description = str(item.description ?? item.profile)
    location    = str(item.location ?? item.city ?? item.office)
    url         = str(item.url ?? item.websiteUrl)

  } else if (source === "indeed") {
    // misceres/indeed-scraper output fields
    title       = str(item.positionName ?? item.title)
    company     = str(item.company ?? item.companyName)
    description = str(item.description ?? item.jobDescription)
    location    = str(item.location ?? item.jobLocation)
    url         = str(item.url ?? item.jobUrl)
    salary      = str(item.salary ?? item.salaryText) || null
  }

  // Strip HTML tags from description (LinkedIn returns HTML)
  description = stripHtml(description)

  // ── Validate ──────────────────────────────────────────────────────
  if (!isValidJobPosting(title, company, description)) return null
  if (!url) return null

  // ── Normalise ─────────────────────────────────────────────────────
  const normalisedCompany = normaliseCompany(company)
  const region = detectRegion(location)
  const niveau = extractNiveau(title, description)
  const contractType = extractContractType(title, description)

  return {
    title:        title.trim().slice(0, 255),
    company:      normalisedCompany.slice(0, 255),
    description:  description.trim().slice(0, 10_000),
    location:     location.trim().slice(0, 255),
    region,
    filiere:      schoolConfig.filiere,
    niveau,
    contractType,
    salary:       salary ? salary.trim().slice(0, 255) : null,
    url:          url.trim(),
    source,
    apifyActorId: sourceConfig.actorId,
    rawData:      item,
  }
}

/**
 * Processes a full batch of raw items from one actor run.
 * Returns the filtered + transformed array.
 */
export function processBatch(
  items: unknown[],
  school: SchoolKey,
  source: SourceKey
): { jobs: ProcessedJob[]; filtered: number } {
  const jobs: ProcessedJob[] = []
  let filtered = 0

  for (const item of items) {
    const processed = processRawJob(item, school, source)
    if (processed) {
      jobs.push(processed)
    } else {
      filtered++
    }
  }

  return { jobs, filtered }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(val: unknown): string {
  if (typeof val === "string") return val
  if (val == null) return ""
  return String(val)
}

/** Strips HTML tags and decodes basic entities. */
function stripHtml(html: string): string {
  if (!html) return ""
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function detectRegion(location: string): string {
  if (!location) return "France"
  const lower = location.toLowerCase()

  // Direct city / region match
  for (const region of FRENCH_REGIONS) {
    if (lower.includes(region.toLowerCase())) return region
  }

  // Département → city mapping (most common)
  const deptRegionMap: Record<string, string> = {
    "75": "Paris", "77": "Île-de-France", "78": "Île-de-France",
    "91": "Île-de-France", "92": "Île-de-France", "93": "Île-de-France",
    "94": "Île-de-France", "95": "Île-de-France",
    "69": "Lyon", "13": "Marseille", "33": "Bordeaux",
    "31": "Toulouse", "59": "Lille", "44": "Nantes",
    "06": "Nice", "67": "Strasbourg", "34": "Montpellier",
    "35": "Rennes", "38": "Grenoble",
  }

  const deptMatch = location.match(/\b(\d{2})\b/)
  if (deptMatch) {
    const mapped = deptRegionMap[deptMatch[1]]
    if (mapped) return mapped
  }

  return "France"
}
