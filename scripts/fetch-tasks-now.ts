import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { fetchAllTasks } from '../lib/apify/fetch-tasks'

const prisma = new PrismaClient()

async function main() {
  console.log('='.repeat(50))
  console.log('ACE Education — Fetching Apify Task Results')
  console.log('='.repeat(50))

  console.log('\n📥 Fetching from Apify tasks...')
  const result = await fetchAllTasks()

  console.log('\n' + '='.repeat(50))
  console.log('✓ Done!')
  console.log(`  Saved:      ${result.saved}`)
  console.log(`  Filtered:   ${result.filtered}`)
  console.log(`  Duplicates: ${result.duplicates}`)
  if (result.errors.length > 0) {
    console.log(`  Errors (${result.errors.length}):`)
    result.errors.forEach(e => console.log(`    - ${e}`))
  }
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
