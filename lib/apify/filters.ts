import { COMPETITOR_SCHOOLS, COMPETITOR_DESCRIPTION_PHRASES } from "@/config/scraping"

/**
 * Returns true if the job should be EXCLUDED (is from a competitor / training org).
 */
export function isCompetitorJob(company: string, description: string): boolean {
  return isCompetitorCompany(company) || hasCompetitorPhrases(description)
}

/**
 * Checks company name against the competitor list.
 * Case-insensitive, partial match allowed for entries ending with " ".
 */
export function isCompetitorCompany(company: string): boolean {
  if (!company) return false
  const lower = company.toLowerCase().trim()

  return COMPETITOR_SCHOOLS.some((competitor) => {
    const competitorLower = competitor.toLowerCase()
    // Partial prefix match (e.g. "CFA " catches "CFA Limousin")
    if (competitorLower.endsWith(" ")) {
      return lower.startsWith(competitorLower.trim())
    }
    // Exact or substring match
    return lower.includes(competitorLower)
  })
}

/**
 * Scans job description for phrases that indicate it's an apprenticeship-school ad
 * disguised as an employer posting.
 */
export function hasCompetitorPhrases(description: string): boolean {
  if (!description) return false
  const lower = description.toLowerCase()
  return COMPETITOR_DESCRIPTION_PHRASES.some((phrase) => lower.includes(phrase.toLowerCase()))
}

/**
 * Returns true if the job is likely a real employer posting an internship/alternance
 * (not a school trying to recruit students into their program).
 */
export function isValidJobPosting(
  title: string,
  company: string,
  description: string
): boolean {
  if (!title || !company || !description) return false

  // Must not be from a competitor school or contain school-recruiting phrases
  if (isCompetitorJob(company, description)) return false

  // Title must look like a real job, not a school ad
  const titleLower = title.toLowerCase()
  const schoolAdPatterns = [
    "formation ",
    "bachelor ",
    "mastère ",
    "mba ",
    "bts ",
    "bac+",
    "recrutement d'étudiants",
    "programme grande école",
  ]
  if (schoolAdPatterns.some((p) => titleLower.includes(p))) return false

  // Description should be reasonably long (real job postings have substance)
  if (description.trim().length < 100) return false

  return true
}

/**
 * Normalises a company name for consistent storage and dedup.
 */
export function normaliseCompany(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bsas\b|\bsarl\b|\bsa\b|\bscs\b/gi, "")
    .replace(/[,.]$/g, "")
    .trim()
}
