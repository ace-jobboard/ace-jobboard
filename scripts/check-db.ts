import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const total = await prisma.job.count()
  console.log(`\nTotal jobs in DB: ${total}`)

  // All runs in order
  const runs = await prisma.scrapeRun.findMany({ orderBy: { startedAt: "asc" } })
  console.log(`\nAll scrape runs (${runs.length} total):`)
  console.log("School  Source   Found Saved Dupes  Keyword")
  console.log("-".repeat(80))
  for (const r of runs) {
    console.log(
      r.school.padEnd(7),
      r.source.padEnd(9),
      String(r.jobsFound).padStart(5),
      String(r.jobsSaved).padStart(5),
      String(r.duplicates).padStart(5),
      " ", r.keywords
    )
  }

  // Sample jobs
  console.log("\nSample jobs saved:")
  const jobs = await prisma.job.findMany({ take: 10, select: { title: true, company: true, filiere: true, source: true } })
  jobs.forEach(j => console.log(`  [${j.filiere}] ${j.company} — ${j.title}`))

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); prisma.$disconnect() })
