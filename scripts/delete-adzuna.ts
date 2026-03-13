import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local'), override: true })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const groups = await prisma.job.groupBy({ by: ['source'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } })
  console.log('Current sources in DB:')
  for (const g of groups) console.log(`  ${g.source}: ${g._count.id}`)

  const adzunaCount = await prisma.job.count({ where: { source: { in: ['adzuna', 'Adzuna'] } } })
  console.log(`\nAdzuna jobs found: ${adzunaCount}`)

  if (adzunaCount === 0) {
    console.log('Nothing to delete.')
    return
  }

  const byFiliere = await prisma.job.groupBy({ by: ['filiere'], where: { source: { in: ['adzuna', 'Adzuna'] } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } } })
  console.log('Adzuna by filiere:')
  for (const g of byFiliere) console.log(`  ${g.filiere}: ${g._count.id}`)

  const result = await prisma.job.deleteMany({ where: { source: { in: ['adzuna', 'Adzuna'] } } })
  console.log(`\n✅ Deleted ${result.count} Adzuna jobs.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
