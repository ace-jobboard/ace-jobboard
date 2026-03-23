import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local'), override: true })

import { readFileSync, writeFileSync } from 'fs'
import { APIFY_TASKS, TaskConfig } from '../config/tasks'

const TASKS_FILE = resolve(process.cwd(), 'config/tasks.ts')
const ACTOR_ID   = 'shahidirfan/HelloWork-Jobs-Scraper'

function sleep(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}

/**
 * Converts keyword + school into the Apify task name.
 * e.g. "Marketing Sportif", "AMOS" → "HelloWork-Marketing-Sportif-AMOS"
 */
function toTaskName(keyword: string, school: string): string {
  const slug = keyword
    .trim()
    .normalize('NFD')                  // decompose é → e + combining accent
    .replace(/[\u0300-\u036f]/g, '')   // strip combining accents
    .replace(/[^a-zA-Z0-9\s-]/g, '')   // drop any remaining non-ASCII
    .trim()
    .replace(/\s+/g, '-')
  return `HelloWork-${slug}-${school}`
}

/**
 * Calls the Apify API to create a new saved task and returns its ID.
 */
async function createApifyTask(name: string, keyword: string): Promise<string> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) throw new Error('APIFY_API_TOKEN is not set')

  const res = await fetch(`https://api.apify.com/v2/actor-tasks?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actId: ACTOR_ID,
      name,
      input: {
        keyword,
        location: 'France',
        results_wanted: 100,
        max_pages: 10,
        collectDetails: true,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const data = await res.json() as { data?: { id?: string } }
  const taskId = data?.data?.id
  if (!taskId) throw new Error('No taskId in response: ' + JSON.stringify(data))
  return taskId
}

/**
 * Finds the matching line in config/tasks.ts (by source, school, keyword, and empty taskId)
 * and replaces the empty taskId with the real one.
 */
function backfillTaskId(fileContent: string, task: TaskConfig, taskId: string): string {
  const lines = fileContent.split('\n')
  let replaced = false

  const updated = lines.map(line => {
    if (
      !replaced &&
      line.includes(`taskId: ''`) &&
      line.includes(`source: 'hellowork'`) &&
      line.includes(`school: '${task.school}'`) &&
      line.includes(`keyword: '${task.keyword}'`)
    ) {
      replaced = true
      return line.replace(`taskId: ''`, `taskId: '${taskId}'`)
    }
    return line
  })

  if (!replaced) {
    console.warn(`  ⚠️  Could not find matching line for ${task.school} / "${task.keyword}" — file not updated`)
  }

  return updated.join('\n')
}

async function main() {
  if (!process.env.APIFY_API_TOKEN) {
    console.error('Error: APIFY_API_TOKEN is not set in .env.local')
    process.exit(1)
  }

  // Only process HelloWork tasks that have no taskId yet (idempotent)
  const pending = APIFY_TASKS.filter(t => t.source === 'hellowork' && t.taskId === '')

  if (pending.length === 0) {
    console.log('Nothing to do — all HelloWork tasks already have taskIds.')
    return
  }

  console.log(`Found ${pending.length} HelloWork tasks to create.\n`)

  let fileContent = readFileSync(TASKS_FILE, 'utf-8')
  let created = 0
  let failed  = 0

  for (const task of pending) {
    const name = toTaskName(task.keyword, task.school)
    try {
      const taskId = await createApifyTask(name, task.keyword)
      fileContent = backfillTaskId(fileContent, task, taskId)
      console.log(`✅ Created: ${name} → ${taskId}`)
      created++
    } catch (e) {
      console.error(`❌ Failed:  ${name} → ${e}`)
      failed++
    }
    await sleep(500)
  }

  writeFileSync(TASKS_FILE, fileContent, 'utf-8')
  console.log(`\nDone. Created: ${created}, Failed: ${failed}`)
  console.log(`config/tasks.ts updated in place.`)
}

main().catch(e => { console.error(e); process.exit(1) })
