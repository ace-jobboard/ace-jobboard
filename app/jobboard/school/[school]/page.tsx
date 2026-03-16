import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import JobboardClient from '@/app/jobboard/JobboardClient'
import { auth } from '@/auth'

const VALID_SCHOOLS: Record<string, string> = {
  AMOS:  'Sport Management',
  CMH:   'Hôtellerie & Luxe',
  EIDM:  'Mode & Luxe',
  ESDAC: 'Design',
  ENAAI: 'Illustration & Animation',
}

export async function generateMetadata({ params }: { params: Promise<{ school: string }> }) {
  const { school } = await params
  const filiere = VALID_SCHOOLS[school.toUpperCase()]
  if (!filiere) return { title: 'ACE Job Board' }
  return {
    title: `${filiere} — Offres d'alternance et stage | ACE Job Board`,
    description: `Trouvez votre stage ou alternance en ${filiere} sélectionnés par ACE Education.`,
  }
}

export default async function SchoolJobboardPage({ params }: { params: Promise<{ school: string }> }) {
  const { school } = await params
  const schoolKey = school.toUpperCase()
  const filiere = VALID_SCHOOLS[schoolKey]
  if (!filiere) redirect('/jobboard')

  const session = await auth()
  const isLoggedIn = !!session?.user
  const userSchool = (session?.user as { school?: string | null } | undefined)?.school ?? null

  const where = {
    isActive: true,
    filiere,
    NOT: [{ source: 'adzuna' }, { filiere: '_dump' }],
  }

  const [initialJobsRaw, initialTotal] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        location: true,
        filiere: true,
        niveau: true,
        region: true,
        contractType: true,
        url: true,
        source: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.job.count({ where }),
  ])

  // serialize dates
  const initialJobs = initialJobsRaw.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }))

  return (
    <JobboardClient
      isLoggedIn={isLoggedIn}
      userSchool={userSchool}
      initialJobs={initialJobs}
      initialTotal={initialTotal}
      defaultSchool={filiere}
    />
  )
}
