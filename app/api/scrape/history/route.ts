import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const runs = await prisma.scrapeRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
  })

  return NextResponse.json({ runs })
}
