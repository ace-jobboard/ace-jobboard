import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Find users with alerts enabled
  // preferences is stored as Json field — filter in JS since Prisma Json filtering is complex
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, school: true, preferences: true },
  })

  const alertUsers = users.filter((u) => {
    const prefs = u.preferences as Record<string, unknown> | null
    return prefs?.alerts === true
  })

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const previews = await Promise.all(
    alertUsers.map(async (u) => {
      const prefs = u.preferences as Record<string, unknown> | null
      const frequency = (prefs?.frequency as string) ?? 'daily'
      const since = frequency === 'weekly' ? sevenDaysAgo : oneDayAgo

      const where: Record<string, unknown> = {
        isActive: true,
        isApproved: true,
        createdAt: { gte: since },
      }
      if (u.school) where.filiere = u.school
      const contract = prefs?.contract as string | undefined
      if (contract && contract !== 'Any' && contract !== 'Both') {
        where.contractType = contract
      }

      const count = await prisma.job.count({ where: where as never })
      return { user: { id: u.id, email: u.email, name: u.name }, matchingJobCount: count, frequency }
    })
  )

  return NextResponse.json({ previews, totalUsers: alertUsers.length })
}
