import { NextResponse } from 'next/server'
import { fetchAllTasks } from '@/lib/apify/fetch-tasks'

export async function POST(request: Request) {
  const secret = request.headers.get('x-scrape-secret')
  if (secret !== process.env.SCRAPE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[fetch-tasks] Starting full task fetch...')
    const result = await fetchAllTasks()
    console.log('[fetch-tasks] Done:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[fetch-tasks] Fatal error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
