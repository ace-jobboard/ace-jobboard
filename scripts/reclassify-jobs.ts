import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local'), override: true })

import { PrismaClient } from '@prisma/client'
import { classifyFiliere, DUMP_FILIERE } from '../lib/apify/classify'

const prisma = new PrismaClient()

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, title: true, description: true, filiere: true },
  })

  console.log(`Reclassifying ${jobs.length} jobs...\n`)

  let reclassified = 0
  let dumped = 0
  let unchanged = 0

  for (const job of jobs) {
    const newFiliere = classifyFiliere(job.title, job.description, job.filiere)
    if (newFiliere === job.filiere) { unchanged++; continue }

    await prisma.job.update({ where: { id: job.id }, data: { filiere: newFiliere } })

    if (newFiliere === DUMP_FILIERE) {
      console.log(`[dump]       "${job.title.slice(0, 65)}"  (was: ${job.filiere})`)
      dumped++
    } else {
      console.log(`[reclassify] "${job.title.slice(0, 65)}"  ${job.filiere} → ${newFiliere}`)
      reclassified++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`Unchanged:    ${unchanged}`)
  console.log(`Reclassified: ${reclassified}`)
  console.log(`Dumped:       ${dumped}`)
  console.log('='.repeat(50))
}

main().finally(() => prisma.$disconnect())
