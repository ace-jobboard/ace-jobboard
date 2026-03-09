import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

const TOKEN = process.env.APIFY_API_TOKEN
const TASK_ID = 'klU0TMpb8vS2dPU8L' // ESDAC UX designer

async function main() {
  console.log('Token:', TOKEN ? TOKEN.slice(0, 20) + '...' : 'MISSING')

  // 1. Check last run
  const runsUrl = `https://api.apify.com/v2/actor-tasks/${TASK_ID}/runs?limit=1&desc=1&token=${TOKEN}`
  console.log('\nFetching:', runsUrl.replace(TOKEN!, 'TOKEN'))
  const runsRes = await fetch(runsUrl)
  const runsData = await runsRes.json()
  console.log('HTTP status:', runsRes.status)
  console.log('Full response:', JSON.stringify(runsData, null, 2).slice(0, 2000))

  // 2. If we got a run, fetch its dataset
  const run = (runsData as any)?.data?.items?.[0]
  if (run) {
    console.log('\nLast run status:', run.status)
    console.log('Dataset ID:', run.defaultDatasetId)

    const datasetUrl = `https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?clean=true&token=${TOKEN}`
    const datasetRes = await fetch(datasetUrl)
    const items = await datasetRes.json()
    console.log('\nDataset HTTP status:', datasetRes.status)
    console.log('Item count:', Array.isArray(items) ? items.length : 'not an array')
    if (Array.isArray(items) && items.length > 0) {
      console.log('\nFirst item keys:', Object.keys(items[0] as object))
      console.log('First item:', JSON.stringify(items[0], null, 2).slice(0, 1000))
    }
  }
}

main().catch(console.error)
