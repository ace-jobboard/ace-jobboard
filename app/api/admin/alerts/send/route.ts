import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const u of alertUsers) {
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

    try {
      const count = await prisma.job.count({ where: where as never })
      if (count === 0) { skipped++; continue }

      // TODO: call HubSpot transactional email API here
      console.log(`[alerts] Would send email to ${u.email} with ${count} matching jobs`)

      // Update lastAlertSentAt in preferences
      await prisma.user.update({
        where: { id: u.id },
        data: {
          preferences: {
            ...(prefs ?? {}),
            lastAlertSentAt: now.toISOString(),
          },
        },
      })
      sent++
    } catch (e) {
      errors.push(`${u.email}: ${e}`)
    }
  }

  return NextResponse.json({ sent, skipped, errors })
}
