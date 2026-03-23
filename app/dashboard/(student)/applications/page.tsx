import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AppShell from '@/components/layout/AppShell'
import ApplicationsClient from './ApplicationsClient'

export default async function ApplicationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const applications = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    include: { job: { select: { id: true, title: true, company: true, location: true, filiere: true, contractType: true, url: true } } },
    orderBy: { appliedAt: 'desc' },
  })

  const serialized = applications.map(a => ({
    ...a,
    appliedAt: a.appliedAt.toISOString(),
  }))

  return (
    <AppShell>
      <ApplicationsClient applications={serialized} />
    </AppShell>
  )
}
