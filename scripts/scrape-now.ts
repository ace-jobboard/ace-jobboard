/**
 * scripts/scrape-now.ts
 *
 * Standalone script to populate the database with fresh job listings.
 * Run with:  npx tsx scripts/scrape-now.ts
 *
 * Requires APIFY_API_TOKEN and DATABASE_URL in .env or environment.
 */

import { config } from "dotenv"
import { resolve } from "path"
// Next.js uses .env.local — load it explicitly for standalone scripts
config({ path: resolve(process.cwd(), ".env.local") })
import { PrismaClient } from "@prisma/client"
import { ApifyClient } from "apify-client"
import { SCRAPING_CONFIG, SchoolKey, SourceKey } from "../config/scraping"
import { processBatch } from "../lib/apify/processor"

const prisma = new PrismaClient()

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitForRun(runId: string): Promise<string> {
  const deadline = Date.now() + 300_000 // 5 min timeout
  while (Date.now() < deadline) {
    const run = await apify.run(runId).get()
    if (!run) throw new Error(`Run ${runId} not found`)
    if (["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(run.status)) {
      return run.status
    }
    process.stdout.write(".")
    await sleep(5_000)
  }
  throw new Error(`Run timed out after 5 minutes`)
}

function buildInput(source: SourceKey, keyword: string, maxResults: number): Record<string, unknown> {
  if (source === "linkedin") {
    return {
      queries: [keyword],
      locationsFilter: ["France"],
      maximumJobsPerQuery: maxResults,
      employmentType: "Internship",
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

async function scrapeOne(school: SchoolKey, source: SourceKey, keyword: string): Promise<{
  saved: number; filtered: number; duplicates: number
}> {
  const schoolConfig = SCRAPING_CONFIG[school]
  const sourceConfig = schoolConfig.sources[source]!

  const input = buildInput(source, keyword, sourceConfig.maxResults)

  // Start run
  const run = await apify.actor(sourceConfig.actorId).start(input, { waitForFinish: 0 })
  process.stdout.write(`  ▶ ${school}/${source} "${keyword}" [${run.id}]`)

  // Wait
  const finalStatus = await waitForRun(run.id)
  console.log(` → ${finalStatus}`)

  if (finalStatus !== "SUCCEEDED") {
    await prisma.scrapeRun.create({
      data: { school, source, status: "FAILED", keywords: keyword, apifyRunId: run.id, error: finalStatus, completedAt: new Date() },
    })
    return { saved: 0, filtered: 0, duplicates: 0 }
  }

  // Fetch dataset
  const { items } = await apify.dataset(run.defaultDatasetId).listItems({ clean: true })
  const { jobs, filtered } = processBatch(items, school, source)

  let saved = 0
  let duplicates = 0

  for (const job of jobs) {
    try {
      const existing = await prisma.job.findUnique({ where: { url: job.url } })
      if (existing) {
        await prisma.job.update({
          where: { id: existing.id },
          data: { lastSeenAt: new Date(), isActive: true },
        })
        duplicates++
      } else {
        await prisma.job.create({
          data: {
            title:        job.title,
            company:      job.company,
            description:  job.description,
            location:     job.location,
            region:       job.region,
            filiere:      job.filiere,
            niveau:       job.niveau,
            contractType: job.contractType,
            salary:       job.salary,
            url:          job.url,
            source:       job.source,
            sources:      [job.source],
            apifyActorId: job.apifyActorId,
            rawData:      job.rawData as object,
            isApproved:   true,
            isActive:     true,
          },
        })
        saved++
      }
    } catch (err) {
      console.error("    ✗ upsert failed:", job.url, (err as Error).message)
    }
  }

  await prisma.scrapeRun.create({
    data: {
      school, source, status: "SUCCEEDED", keywords: keyword,
      apifyRunId: run.id, jobsFound: items.length, jobsFiltered: filtered,
      jobsSaved: saved, duplicates, completedAt: new Date(),
    },
  })

  return { saved, filtered, duplicates }
}

async function main() {
  console.log("=".repeat(60))
  console.log("ACE Education — Apify Job Scraper")
  console.log(`Token: ${process.env.APIFY_API_TOKEN ? "✓ set" : "✗ MISSING"}`)
  console.log("=".repeat(60))

  if (!process.env.APIFY_API_TOKEN) {
    console.error("ERROR: APIFY_API_TOKEN is not set. Add it to .env.local")
    process.exit(1)
  }

  let totalSaved = 0
  let totalFiltered = 0
  let totalDuplicates = 0
  let totalErrors = 0

  const schools = Object.keys(SCRAPING_CONFIG) as SchoolKey[]

  for (const school of schools) {
    const schoolConfig = SCRAPING_CONFIG[school]
    console.log(`\n▶▶ ${school} — ${schoolConfig.name}`)

    const sources = Object.keys(schoolConfig.sources) as SourceKey[]

    for (const source of sources) {
      const sourceConfig = schoolConfig.sources[source]!
      console.log(`  Source: ${source} (${sourceConfig.actorId})`)

      for (const keyword of sourceConfig.keywords) {
        try {
          const { saved, filtered, duplicates } = await scrapeOne(school, source, keyword)
          totalSaved      += saved
          totalFiltered   += filtered
          totalDuplicates += duplicates
          console.log(`    ✓ saved: ${saved}, filtered: ${filtered}, dupes: ${duplicates}`)
        } catch (err) {
          totalErrors++
          console.error(`    ✗ error: ${(err as Error).message}`)
        }
      }
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("DONE")
  console.log(`  Total saved:      ${totalSaved}`)
  console.log(`  Total filtered:   ${totalFiltered}`)
  console.log(`  Total duplicates: ${totalDuplicates}`)
  console.log(`  Total errors:     ${totalErrors}`)
  console.log("=".repeat(60))

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  prisma.$disconnect()
  process.exit(1)
})
