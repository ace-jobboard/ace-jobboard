import { NextResponse } from "next/server"
import { SCRAPING_CONFIG, SchoolKey, SourceKey } from "@/config/scraping"

/**
 * POST /api/scrape/run-all
 *
 * Iterates all schools × sources × keywords sequentially (to avoid rate limits).
 * Protected by the same SCRAPE_SECRET bearer token.
 *
 * Returns a full summary of all runs.
 */
export async function POST(request: Request) {
  // ── Auth check ────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization")
  const secret = process.env.SCRAPE_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.APIFY_API_TOKEN) {
    return NextResponse.json({ error: "APIFY_API_TOKEN is not configured" }, { status: 500 })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
  }

  const summary: Array<{
    school: string
    source: string
    keyword: string
    jobsSaved?: number
    jobsFiltered?: number
    duplicates?: number
    error?: string
  }> = []

  let totalSaved = 0
  let totalFiltered = 0
  let totalDuplicates = 0
  let totalErrors = 0

  const schools = Object.keys(SCRAPING_CONFIG) as SchoolKey[]

  for (const school of schools) {
    const schoolConfig = SCRAPING_CONFIG[school]
    const sources = Object.keys(schoolConfig.sources) as SourceKey[]

    for (const source of sources) {
      const sourceConfig = schoolConfig.sources[source]!
      const keywords = sourceConfig.keywords

      for (const keyword of keywords) {
        console.log(`[run-all] ${school}/${source} "${keyword}"`)

        try {
          const res = await fetch(`${baseUrl}/api/scrape`, {
            method: "POST",
            headers,
            body: JSON.stringify({ school, source, keyword }),
          })

          const data = await res.json()

          if (!res.ok) {
            totalErrors++
            summary.push({ school, source, keyword, error: data.error ?? `HTTP ${res.status}` })
            console.error(`[run-all] FAILED ${school}/${source} "${keyword}":`, data.error)
          } else {
            totalSaved      += data.jobsSaved ?? 0
            totalFiltered   += data.jobsFiltered ?? 0
            totalDuplicates += data.duplicates ?? 0
            summary.push({
              school,
              source,
              keyword,
              jobsSaved:    data.jobsSaved,
              jobsFiltered: data.jobsFiltered,
              duplicates:   data.duplicates,
            })
            console.log(`[run-all] OK ${school}/${source} → saved: ${data.jobsSaved}, filtered: ${data.jobsFiltered}`)
          }
        } catch (err) {
          totalErrors++
          const msg = err instanceof Error ? err.message : String(err)
          summary.push({ school, source, keyword, error: msg })
          console.error(`[run-all] EXCEPTION ${school}/${source} "${keyword}":`, msg)
        }
      }
    }
  }

  return NextResponse.json({
    completed:      true,
    totalSaved,
    totalFiltered,
    totalDuplicates,
    totalErrors,
    runs:           summary.length,
    details:        summary,
  })
}
