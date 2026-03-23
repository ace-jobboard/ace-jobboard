import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SCHOOL_FILIERE } from '@/config/scraping'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ notifications: [], unreadCount: 0 })

  const userId = session.user.id
  const role = (session.user as { role?: string }).role
  const userSchool = (session.user as { school?: string | null }).school ?? null

  // Fetch school from DB since it may not be in JWT
  const dbUser = userSchool === null
    ? await prisma.user.findUnique({ where: { id: userId }, select: { school: true } })
    : null
  const school = userSchool ?? dbUser?.school ?? null

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const notifications: { id: string; type: string; message: string; count: number; href: string; createdAt: string }[] = []

  // New jobs matching user's school (last 24h)
  // school stores the code (AMOS, CMH…); filiere stores the full name
  const filiere = school ? (SCHOOL_FILIERE[school as keyof typeof SCHOOL_FILIERE] ?? school) : null
  if (filiere) {
    const newJobsCount = await prisma.job.count({
      where: { isActive: true, isApproved: true, filiere, createdAt: { gte: oneDayAgo } },
    })
    if (newJobsCount > 0) {
      notifications.push({
        id: 'new_jobs',
        type: 'new_jobs',
        message: `${newJobsCount} nouvelle${newJobsCount > 1 ? 's' : ''} offre${newJobsCount > 1 ? 's' : ''} pour ${school}`,
        count: newJobsCount,
        href: `/jobboard?school=${encodeURIComponent(school!)}`,
        createdAt: new Date().toISOString(),
      })
    }
  }

  // Pending approval (admin only)
  if (role === 'ADMIN') {
    const pendingCount = await prisma.job.count({ where: { isApproved: false, isActive: true } })
    if (pendingCount > 0) {
      notifications.push({
        id: 'pending_approval',
        type: 'pending_approval',
        message: `${pendingCount} offre${pendingCount > 1 ? 's' : ''} en attente d'approbation`,
        count: pendingCount,
        href: '/offers?tab=pending',
        createdAt: new Date().toISOString(),
      })
    }
  }

  return NextResponse.json({ notifications, unreadCount: notifications.length })
}
