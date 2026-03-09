import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { SchoolKey, SourceKey, SCRAPING_CONFIG } from "@/config/scraping"
import { startActorRun, waitForRun, fetchDataset } from "@/lib/apify/client"
import { processBatch } from "@/lib/apify/processor"

/**
 * POST /api/scrape
 *
 * Body: { school: SchoolKey, source: SourceKey, keyword: string }
 *
 * Triggers one Apify actor run for a single keyword, waits for completion,
 * processes results, upserts jobs, and records a ScrapeRun.
 *
 * Protected by SCRAPE_SECRET bearer token.
 */
export async function POST(request: Request) {
  // ── Auth check ────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization")
  const secret = process.env.SCRAPE_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { school?: string; source?: string; keyword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { school, source, keyword } = body

  // ── Validate ──────────────────────────────────────────────────────
  if (!school || !source) {
    return NextResponse.json({ error: "school and source are required" }, { status: 400 })
  }

  const schoolKey = school as SchoolKey
  const sourceKey = source as SourceKey
  const schoolConfig = SCRAPING_CONFIG[schoolKey]

  if (!schoolConfig) {
    return NextResponse.json({ error: `Unknown school: ${school}` }, { status: 400 })
  }

  const sourceConfig = schoolConfig.sources[sourceKey]
  if (!sourceConfig) {
    return NextResponse.json({ error: `Source ${source} not configured for ${school}` }, { status: 400 })
  }

  // Find keyword index (or use first keyword if not specified)
  let keywordIndex = 0
  if (keyword) {
    const idx = sourceConfig.keywords.indexOf(keyword)
    if (idx === -1) {
      return NextResponse.json({ error: `Keyword "${keyword}" not found for ${school}/${source}` }, { status: 400 })
    }
    keywordIndex = idx
  }

  const resolvedKeyword = sourceConfig.keywords[keywordIndex]
  const startedAt = new Date()

  // Create a ScrapeRun record immediately
  const scrapeRun = await prisma.scrapeRun.create({
    data: {
      school: schoolKey,
      source: sourceKey,
      status: "RUNNING",
      keywords: resolvedKeyword,
    },
  })

  try {
    // ── Start actor run ───────────────────────────────────────────
    console.log(`[scrape] Starting ${school}/${source} "${resolvedKeyword}"`)
    const { runId, datasetId } = await startActorRun({ school: schoolKey, source: sourceKey, keywordIndex })

    // Update run record with Apify run ID
    await prisma.scrapeRun.update({
      where: { id: scrapeRun.id },
      data: { apifyRunId: runId },
    })

    // ── Wait for completion ───────────────────────────────────────
    const finalStatus = await waitForRun(runId)
    console.log(`[scrape] Run ${runId} finished: ${finalStatus}`)

    if (finalStatus !== "SUCCEEDED") {
      await prisma.scrapeRun.update({
        where: { id: scrapeRun.id },
        data: { status: "FAILED", error: `Actor finished with status: ${finalStatus}`, completedAt: new Date() },
      })
      return NextResponse.json({ error: `Actor run failed: ${finalStatus}` }, { status: 500 })
    }

    // ── Fetch & process dataset ───────────────────────────────────
    const rawItems = await fetchDataset(datasetId)
    console.log(`[scrape] Fetched ${rawItems.length} raw items`)

    const { jobs, filtered } = processBatch(rawItems, schoolKey, sourceKey)
    console.log(`[scrape] ${jobs.length} valid jobs, ${filtered} filtered`)

    // ── Upsert to database ────────────────────────────────────────
    let jobsSaved = 0
    let duplicates = 0

    for (const job of jobs) {
      try {
        const result = await prisma.job.upsert({
          where: { url: job.url },
          update: {
            lastSeenAt: new Date(),
            sources: { push: job.source },
            isActive: true,
          },
          create: {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rawData:      job.rawData as any,
            isApproved:   true,
            isActive:     true,
            firstSeenAt:  new Date(),
            lastSeenAt:   new Date(),
          },
        })

        // If the job existed before (lastSeenAt was just updated) it's a duplicate
        if (result.firstSeenAt < result.lastSeenAt || result.sources.length > 1) {
          duplicates++
        } else {
          jobsSaved++
        }
      } catch (err) {
        console.error("[scrape] Failed to upsert job:", job.url, err)
      }
    }

    // ── Finalise ScrapeRun ────────────────────────────────────────
    const completedAt = new Date()
    const runTime = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)

    await prisma.scrapeRun.update({
      where: { id: scrapeRun.id },
      data: {
        status:      "SUCCEEDED",
        jobsFound:   rawItems.length,
        jobsFiltered: filtered,
        jobsSaved,
        duplicates,
        completedAt,
        runTime,
      },
    })

    return NextResponse.json({
      success:     true,
      school:      schoolKey,
      source:      sourceKey,
      keyword:     resolvedKeyword,
      jobsFound:   rawItems.length,
      jobsFiltered: filtered,
      jobsSaved,
      duplicates,
      runId,
      runTime,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error("[scrape] Unexpected error:", errorMsg)

    await prisma.scrapeRun.update({
      where: { id: scrapeRun.id },
      data: { status: "FAILED", error: errorMsg, completedAt: new Date() },
    }).catch(() => {}) // don't throw if this update also fails

    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
