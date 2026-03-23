import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { fetchAllTasks } from "@/lib/apify/fetch-tasks"
import { ScrapeStatus } from "@prisma/client"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startMs = Date.now()

  try {
    const result = await fetchAllTasks()
    const durationMs = Date.now() - startMs
    const fetched = result.saved + result.duplicates + result.filtered

    await prisma.scrapeRun.create({
      data: {
        startedAt:   new Date(Date.now() - durationMs),
        completedAt: new Date(),
        jobsFound:   fetched,
        jobsSaved:   result.saved,
        jobsFiltered: result.filtered,
        duplicates:  result.duplicates,
        error:       result.errors.length > 0 ? result.errors.join("; ") : null,
        source:      "all",
        school:      "all",
        status:      result.errors.length > 0 ? ScrapeStatus.FAILED : ScrapeStatus.SUCCEEDED,
      },
    })

    return NextResponse.json({
      totals: {
        fetched,
        saved:      result.saved,
        duplicates: result.duplicates,
        filtered:   result.filtered,
      },
      durationMs,
      errors: result.errors,
    })
  } catch (error) {
    console.error("[api/sync] error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
