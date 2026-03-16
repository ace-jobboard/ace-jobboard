import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { fetchAllTasks } from "@/lib/apify/fetch-tasks"

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
