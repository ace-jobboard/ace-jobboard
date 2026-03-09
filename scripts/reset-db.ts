/**
 * scripts/reset-db.ts
 *
 * Clears all job data and scrape run history from the database.
 * Run BEFORE the first scrape to start with a clean slate.
 *
 * Usage:  npx tsx scripts/reset-db.ts
 *
 * WARNING: This permanently deletes all Job and ScrapeRun records.
 * SavedJob references will cascade-delete too (FK constraint).
 */

import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("⚠️  This will permanently delete ALL jobs and scrape run history.")
  console.log("    (User accounts, sessions, and saved-job links will also be cleared via cascade)")
  console.log("")

  // Safety prompt when running interactively
  if (process.stdin.isTTY) {
    const readline = await import("readline")
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const answer = await new Promise<string>((resolve) =>
      rl.question("Type YES to confirm: ", resolve)
    )
    rl.close()

    if (answer.trim() !== "YES") {
      console.log("Aborted.")
      await prisma.$disconnect()
      return
    }
  }

  console.log("\nDeleting ScrapeRun records...")
  const { count: runsDeleted } = await prisma.scrapeRun.deleteMany({})
  console.log(`  ✓ Deleted ${runsDeleted} ScrapeRun records`)

  console.log("Deleting Job records (SavedJob will cascade)...")
  const { count: jobsDeleted } = await prisma.job.deleteMany({})
  console.log(`  ✓ Deleted ${jobsDeleted} Job records`)

  console.log("\nDatabase reset complete. Ready for a fresh scrape.")
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error("Reset failed:", err)
  prisma.$disconnect()
  process.exit(1)
})
