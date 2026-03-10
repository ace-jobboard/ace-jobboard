import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { fetchAllTasks } from "@/lib/apify/fetch-tasks"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await fetchAllTasks()
    return NextResponse.json({
      synced:  result.saved,
      skipped: result.duplicates,
      filtered: result.filtered,
      errors:  result.errors,
    })
  } catch (error) {
    console.error("[api/sync] error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
