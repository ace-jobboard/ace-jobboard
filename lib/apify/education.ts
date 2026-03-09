/**
 * Extracts education level (niveau) from job title and description.
 * Returns "Bac+3", "Bac+4", or "Bac+5".
 * Defaults to "Bac+3" when nothing is found.
 */
export function extractNiveau(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()

  // Explicit numeric level patterns
  const patterns: Array<[RegExp, string]> = [
    [/bac\s*\+\s*5|master\s*2|m2|mba|mastère|niveau\s*7/i, "Bac+5"],
    [/bac\s*\+\s*4|master\s*1|m1|niveau\s*6/i, "Bac+4"],
    [/bac\s*\+\s*3|bachelor|licence\s*pro|niveau\s*5/i, "Bac+3"],
  ]

  for (const [pattern, niveau] of patterns) {
    if (pattern.test(text)) return niveau
  }

  // Keyword heuristics when no explicit level found
  const seniorKeywords = ["directeur", "responsable", "manager", "chef de projet", "head of"]
  const midKeywords = ["chargé de", "coordinateur", "assistant manager", "junior manager"]

  if (seniorKeywords.some((kw) => text.includes(kw))) return "Bac+5"
  if (midKeywords.some((kw) => text.includes(kw))) return "Bac+4"

  return "Bac+3"
}

/**
 * Determines the contract type from the job title/description.
 * Returns one of the values used in Filters.tsx.
 */
export function extractContractType(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()

  if (/contrat\s+de\s+professionnalisation|contrat\s+pro\b/.test(text)) {
    return "Contrat de professionnalisation"
  }
  if (/apprentissage|contrat\s+d.apprentissage/.test(text)) {
    return "Apprentissage"
  }
  if (/alternance|en\s+alternance/.test(text)) {
    return "Alternance"
  }
  if (/stage|intern(ship)?/.test(text)) {
    return "Stage"
  }

  // Default for this job board
  return "Alternance"
}
