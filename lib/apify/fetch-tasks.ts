import { prisma } from '@/lib/db'
import { APIFY_TASKS } from '@/config/tasks'
import { classifyFiliere } from '@/lib/apify/classify'

// ---------------------------------------------------------------------------
// Source field mapping
// ---------------------------------------------------------------------------

type RawItem = Record<string, unknown>

interface NormalizedFields {
  title: string
  company: string
  location: string
  description: string
  url: string
  contractTypeRaw: string
  salary: string | null
}

interface SourceFieldMap {
  title:           (item: RawItem) => string
  company:         (item: RawItem) => string
  location:        (item: RawItem) => string
  description:     (item: RawItem) => string
  url:             (item: RawItem) => string
  contractTypeRaw: (item: RawItem) => string
  salary:          (item: RawItem) => string | null
}

function str(v: unknown): string {
  return v ? String(v) : ''
}

function first(item: RawItem, ...keys: string[]): string {
  for (const k of keys) {
    if (item[k]) return String(item[k])
  }
  return ''
}

/**
 * Field map for shahidirfan/Jungle-Job-Scraper (Welcome to the Jungle / WTTJ actor).
 * Docs: https://apify.com/shahidirfan/jungle-job-scraper
 */
const WTTJ_MAP: SourceFieldMap = {
  title:           (item) => first(item, 'title', 'name'),
  company:         (item) => str(item.company),
  location:        (item) => first(item, 'location', 'city'),
  description:     (item) => first(item, 'job_description', 'description', 'body'),
  url:             (item) => first(item, 'url', 'websiteUrl'),
  contractTypeRaw: (item) => first(item, 'contract_type', 'contractType'),
  salary:          (item) => item.salary_yearly_minimum
                               ? `${item.salary_yearly_minimum}€/an`
                               : item.salary ? String(item.salary) : null,
}

/**
 * Field map for curious_coder/linkedin-jobs-scraper (LinkedIn Jobs actor).
 * Docs: https://apify.com/curious_coder/linkedin-jobs-scraper
 *
 * TODO: LinkedIn's `employmentType` field ("Internship", "Full-time", etc.) cannot
 * reliably distinguish "Stage" from "Alternance" for French listings — it is passed
 * through as-is and mapped downstream by extractContractType via title-keyword fallback.
 */
const LINKEDIN_MAP: SourceFieldMap = {
  title:           (item) => str(item.title),
  company:         (item) => str(item.companyName),
  location:        (item) => str(item.location),
  description:     (item) => first(item, 'descriptionHtml', 'descriptionText'),
  url:             (item) => first(item, 'link', 'applyUrl'),
  contractTypeRaw: (item) => str(item.employmentType),
  salary:          (item) => item.salary
                               ? String(item.salary)
                               : item.salaryInfo ? String(item.salaryInfo) : null,
}

const SOURCE_MAPS: Record<string, SourceFieldMap> = {
  wttj:      WTTJ_MAP,
  linkedin:  LINKEDIN_MAP,
}

function normalizeItem(item: RawItem, source: string): NormalizedFields {
  const map = SOURCE_MAPS[source] ?? WTTJ_MAP
  return {
    title:           map.title(item),
    company:         map.company(item),
    location:        map.location(item),
    description:     map.description(item),
    url:             map.url(item),
    contractTypeRaw: map.contractTypeRaw(item),
    salary:          map.salary(item),
  }
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

const COMPETITOR_COMPANIES = [
  'ifae', 'iscod', 'galileo', 'esg sport', 'win sport school',
  'nuevo cfa', 'pigier', 'alticome', 'prisma formations',
  'stand up formation', 'efrei', 'epitech', 'supinfo',
  'ecole de', 'école de', 'cfa ', 'institut de formation',
  'centre de formation',
]

const COMPETITOR_PHRASES = [
  'notre partenaire école', 'notre école partenaire',
  'formation diplômante', 'école de commerce',
  'centre de formation', 'frais de scolarité',
  "frais d'inscription", 'rejoignez notre école',
  'intégrez notre formation', 'devenez étudiant',
  'recrutement étudiant', 'bachelor en alternance chez nous',
]

function isCompetitor(company: string, description: string): boolean {
  const companyLower = (company || '').toLowerCase()
  const descLower = (description || '').toLowerCase()
  return (
    COMPETITOR_COMPANIES.some(c => companyLower.includes(c)) ||
    COMPETITOR_PHRASES.some(p => descLower.includes(p))
  )
}

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

function extractRegion(location: string): string {
  if (!location) return 'France'
  const lower = location.toLowerCase()
  if (lower.includes('paris') || lower.includes('île-de-france') || lower.includes('ile-de-france')) return 'Île-de-France'
  if (lower.includes('lyon') || lower.includes('auvergne')) return 'Auvergne-Rhône-Alpes'
  if (lower.includes('marseille') || lower.includes('provence')) return "Provence-Alpes-Côte d'Azur"
  if (lower.includes('bordeaux') || lower.includes('aquitaine')) return 'Nouvelle-Aquitaine'
  if (lower.includes('toulouse') || lower.includes('occitanie')) return 'Occitanie'
  if (lower.includes('lille') || lower.includes('hauts-de-france')) return 'Hauts-de-France'
  if (lower.includes('nantes') || lower.includes('pays de la loire')) return 'Pays de la Loire'
  if (lower.includes('strasbourg') || lower.includes('grand est')) return 'Grand Est'
  if (lower.includes('rennes') || lower.includes('bretagne')) return 'Bretagne'
  if (lower.includes('nice') || lower.includes("côte d'azur")) return "Provence-Alpes-Côte d'Azur"
  return 'France'
}

function extractContractType(contractType: string, title: string): string {
  const type = (contractType || '').toLowerCase()
  const titleLower = (title || '').toLowerCase()
  if (type === 'apprenticeship' || titleLower.includes('alternance')) return 'Alternance'
  if (type === 'internship' || titleLower.includes('stage')) return 'Stage'
  return 'Alternance'
}

function extractNiveau(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  if (/bac\s*\+\s*5|master\s*2|m2|mba|mastère|niveau\s*7/i.test(text)) return 'Bac+5'
  if (/bac\s*\+\s*4|master\s*1|m1|niveau\s*6/i.test(text)) return 'Bac+4'
  if (/bac\s*\+\s*3|bachelor|licence\s*pro|niveau\s*5/i.test(text)) return 'Bac+3'
  return 'Bac+3'
}

// ---------------------------------------------------------------------------
// Apify fetching
// ---------------------------------------------------------------------------

async function getLastRunDataset(taskId: string): Promise<unknown[]> {
  // Read token at call-time so dotenv has already loaded it
  const token = process.env.APIFY_API_TOKEN
  if (!token) throw new Error('APIFY_API_TOKEN is not set')

  const runsRes = await fetch(
    `https://api.apify.com/v2/actor-tasks/${taskId}/runs?limit=1&desc=1&token=${token}`
  )
  const runsData = await runsRes.json() as { data?: { items?: Array<{ status: string; defaultDatasetId: string }> } }
  const lastRun = runsData?.data?.items?.[0]

  if (!lastRun || lastRun.status !== 'SUCCEEDED') {
    console.log(`[fetch-tasks] Task ${taskId} has no successful run yet, skipping`)
    return []
  }

  const datasetRes = await fetch(
    `https://api.apify.com/v2/datasets/${lastRun.defaultDatasetId}/items?clean=true&token=${token}`
  )
  const items = await datasetRes.json()
  return Array.isArray(items) ? items : []
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function fetchAllTasks(): Promise<{
  saved: number
  filtered: number
  duplicates: number
  errors: string[]
}> {
  let saved = 0
  let filtered = 0
  let duplicates = 0
  const errors: string[] = []

  for (const task of APIFY_TASKS) {
    console.log(`[fetch-tasks] ${task.school} / "${task.keyword}" (${task.source})`)
    try {
      const items = await getLastRunDataset(task.taskId)
      console.log(`[fetch-tasks]   → ${items.length} items`)

      for (const raw of items) {
        const item = raw as RawItem
        const { title, company, location, description, url, contractTypeRaw, salary } =
          normalizeItem(item, task.source)

        if (!title || !url || !company) { filtered++; continue }
        if (isCompetitor(company, description)) { filtered++; continue }

        const filiere = classifyFiliere(title, description, task.filiere)

        const job = {
          title:        title.trim().slice(0, 255),
          company:      company.trim().slice(0, 255),
          description:  description.trim().slice(0, 10_000),
          location:     location.trim().slice(0, 255),
          region:       extractRegion(location),
          filiere,
          niveau:       extractNiveau(title, description),
          contractType: extractContractType(contractTypeRaw, title),
          salary,
          url:          url.trim(),
          source:       task.source,
          apifyActorId: task.taskId,
          isApproved:   true,
          isActive:     true,
        }

        try {
          const existing = await prisma.job.findUnique({ where: { url: job.url } })
          if (existing) {
            await prisma.job.update({
              where: { url: job.url },
              data: { lastSeenAt: new Date(), isActive: true },
            })
            duplicates++
          } else {
            await prisma.job.create({
              data: {
                ...job,
                sources:     [task.source],
                firstSeenAt: new Date(),
                lastSeenAt:  new Date(),
              },
            })
            saved++
          }
        } catch (e) {
          errors.push(`Failed to save ${url}: ${e}`)
        }
      }

      console.log(`[fetch-tasks]   → saved: ${saved}, filtered: ${filtered}, dupes: ${duplicates}`)
    } catch (e) {
      const msg = `Task ${task.taskId} (${task.keyword}) failed: ${e}`
      errors.push(msg)
      console.error(`[fetch-tasks] ${msg}`)
    }
  }

  return { saved, filtered, duplicates, errors }
}
