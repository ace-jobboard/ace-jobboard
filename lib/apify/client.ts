import { ApifyClient } from "apify-client"
import { SchoolKey, SourceKey, SCRAPING_CONFIG } from "@/config/scraping"

if (!process.env.APIFY_API_TOKEN) {
  console.warn("[Apify] APIFY_API_TOKEN is not set — scraping will fail at runtime")
}

export const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN ?? "",
})

export interface RunActorOptions {
  school: SchoolKey
  source: SourceKey
  /** Run a single keyword by index instead of all */
  keywordIndex?: number
}

export interface ActorRunResult {
  runId: string
  datasetId: string
  status: string
}

/**
 * Starts an Apify actor run for one school + source + keyword.
 * Returns the run ID and dataset ID immediately (run is async on Apify side).
 */
export async function startActorRun(opts: RunActorOptions): Promise<ActorRunResult> {
  const { school, source, keywordIndex = 0 } = opts
  const schoolConfig = SCRAPING_CONFIG[school]
  const sourceConfig = schoolConfig.sources[source]

  if (!sourceConfig) {
    throw new Error(`No ${source} config for school ${school}`)
  }

  const keyword = sourceConfig.keywords[keywordIndex]
  if (!keyword) {
    throw new Error(`Keyword index ${keywordIndex} out of range for ${school}/${source}`)
  }

  const input = buildActorInput(source, keyword, sourceConfig.location, sourceConfig.maxResults)

  const run = await apifyClient.actor(sourceConfig.actorId).start(input, {
    waitForFinish: 0, // don't wait — poll via status endpoint
  })

  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
    status: run.status,
  }
}

/**
 * Waits for a run to finish (polling) and returns final status.
 * Useful for synchronous one-off runs.
 */
export async function waitForRun(runId: string, timeoutMs = 300_000): Promise<string> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const run = await apifyClient.run(runId).get()
    if (!run) throw new Error(`Run ${runId} not found`)
    if (["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(run.status)) {
      return run.status
    }
    await sleep(5_000)
  }
  throw new Error(`Run ${runId} timed out after ${timeoutMs}ms`)
}

/**
 * Fetches all items from a completed dataset.
 */
export async function fetchDataset(datasetId: string): Promise<unknown[]> {
  const { items } = await apifyClient.dataset(datasetId).listItems({ clean: true })
  return items
}

/**
 * Gets the current status of a run.
 */
export async function getRunStatus(runId: string) {
  const run = await apifyClient.run(runId).get()
  return run ?? null
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Builds actor-specific input for a SINGLE keyword.
 *
 * harvestapi/linkedin-job-search  → queries[], locationsFilter, maximumJobsPerQuery, employmentType
 * shahidirfan/Jungle-Job-Scraper  → searchKeyword, countryCode, contractType, maxResults
 * misceres/indeed-scraper         → position, country, location, maxItems
 */
function buildActorInput(
  source: SourceKey,
  keyword: string,
  location: string,
  maxResults: number
): Record<string, unknown> {
  if (source === "linkedin") {
    return {
      queries: [keyword],
      locationsFilter: [location],
      maximumJobsPerQuery: maxResults,
      employmentType: "Internship", // covers alternance/stage on LinkedIn
      postedLimit: "month",
      sortBy: "date",
    }
  }

  if (source === "wttj") {
    return {
      searchKeyword: keyword,
      countryCode: "FR",
      contractType: "apprenticeship",
      maxResults,
      maximumPages: 3,
    }
  }

  if (source === "indeed") {
    return {
      position: keyword,
      country: "France",
      location: "France",
      maxItems: maxResults,
      saveOnlyUniqueItems: true,
      scrapeCompanyDetails: true,
    }
  }

  throw new Error(`Unknown source: ${source}`)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
