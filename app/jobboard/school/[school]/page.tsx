import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import JobboardClient from '@/app/jobboard/JobboardClient'
import { auth } from '@/auth'
import Link from 'next/link'
import PublicNavbar from '@/components/layout/PublicNavbar'

const VALID_SCHOOLS: Record<string, string> = {
  AMOS:  'Sport Management',
  CMH:   'Hôtellerie & Luxe',
  EIDM:  'Mode & Luxe',
  ESDAC: 'Design',
  ENAAI: 'Illustration & Animation',
}

const SCHOOL_CONFIG: Record<string, {
  label: string; fullName: string; description: string; accentClass: string; filiere: string
}> = {
  AMOS:  { label: 'AMOS',  fullName: 'AMOS Sport Management', description: "Offres d'alternance et de stage en sport, marketing sportif et management.", accentClass: 'bg-green-700', filiere: 'Sport Management' },
  CMH:   { label: 'CMH',   fullName: 'CMH Hôtellerie & Luxe', description: 'Offres en hôtellerie, restauration, luxe et management événementiel.', accentClass: 'bg-blue-800', filiere: 'Hôtellerie & Luxe' },
  EIDM:  { label: 'EIDM',  fullName: 'EIDM Mode & Luxe', description: 'Offres en mode, luxe, marketing et communication.', accentClass: 'bg-purple-800', filiere: 'Mode & Luxe' },
  ESDAC: { label: 'ESDAC', fullName: 'ESDAC Design', description: 'Offres en design graphique, UX/UI, direction artistique et motion design.', accentClass: 'bg-orange-700', filiere: 'Design' },
  ENAAI: { label: 'ENAAI', fullName: 'ENAAI Illustration & Animation', description: "Offres en illustration, animation 2D/3D, concept art et jeux vidéo.", accentClass: 'bg-red-700', filiere: 'Illustration & Animation' },
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

  const school_conf = SCHOOL_CONFIG[schoolKey]
  if (!school_conf) redirect('/jobboard')

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

  const userName = session?.user?.name ?? null

  return (
    <div>
      <PublicNavbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        userSchool={userSchool}
      />

      {/* School hero */}
      <div className={`${school_conf.accentClass} text-white py-12`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/jobboard" className="text-white/60 hover:text-white text-sm transition-colors">← Toutes les écoles</Link>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">{school_conf.fullName}</h1>
          <p className="text-white/70 text-lg max-w-xl">{school_conf.description}</p>
          <p className="text-white/50 text-sm mt-3">{initialTotal} offre{initialTotal !== 1 ? 's' : ''} disponible{initialTotal !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <JobboardClient
        isLoggedIn={isLoggedIn}
        userSchool={userSchool}
        initialJobs={initialJobs}
        initialTotal={initialTotal}
        defaultSchool={filiere}
        hideHero={true}
      />
    </div>
  )
}
