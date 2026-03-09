import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })
import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function main() {
  const groups = await p.job.groupBy({ by: ['filiere'], where: { isActive: true }, _count: { _all: true } })
  console.log('Active jobs by filiere:')
  for (const g of groups) {
    const sample = await p.job.findFirst({ where: { filiere: g.filiere, isActive: true }, select: { title: true } })
    console.log(`  ${JSON.stringify(g.filiere)}: ${g._count._all} jobs — e.g. "${sample?.title}"`)
  }
  const total = groups.reduce((s, g) => s + g._count._all, 0)
  console.log(`  TOTAL: ${total}`)
  const hidden = await p.job.count({ where: { isActive: false } })
  console.log(`  Hidden: ${hidden}`)
  await p.$disconnect()
}

main().catch(console.error)
