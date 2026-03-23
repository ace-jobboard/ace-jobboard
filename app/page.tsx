import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import JobCard from '@/components/JobCard'
import HomeSearchBar from '@/components/HomeSearchBar'
import PublicNavbar from '@/components/layout/PublicNavbar'
import { Button } from '@/components/ui/button'
import { Job } from '@/types/job'

const SCHOOLS = [
  { key: 'AMOS',  label: 'AMOS',  filiere: 'Sport Management' },
  { key: 'CMH',   label: 'CMH',   filiere: 'Hôtellerie & Luxe' },
  { key: 'EIDM',  label: 'EIDM',  filiere: 'Mode & Luxe' },
  { key: 'ESDAC', label: 'ESDAC', filiere: 'Design' },
  { key: 'ENAAI', label: 'ENAAI', filiere: 'Illustration & Animation' },
]

const JOB_SELECT = {
  id: true, title: true, company: true, location: true, region: true,
  filiere: true, niveau: true, contractType: true, salary: true,
  url: true, source: true, isApproved: true, isActive: true,
  createdAt: true, tags: true, apifyActorId: true,
  description: true, updatedAt: true,
} as const

export default async function HomePage() {
  const session = await auth()

  // Fetch data in parallel
  const [breakdown, recentJobs, ...schoolCounts] = await Promise.all([
    prisma.job.groupBy({
      by: ['filiere'],
      _count: { id: true },
      where: { isActive: true, NOT: [{ source: 'adzuna' }, { filiere: '_dump' }] },
    }),
    prisma.job.findMany({
      where: { isActive: true, isApproved: true, NOT: [{ source: 'adzuna' }, { filiere: '_dump' }] },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: JOB_SELECT,
    }),
    ...SCHOOLS.map(s => prisma.job.count({
      where: { isActive: true, filiere: s.filiere, NOT: [{ source: 'adzuna' }] },
    })),
  ])

  const breakdownMap: Record<string, number> = {}
  for (const row of breakdown) breakdownMap[row.filiere] = row._count.id
  const totalJobs = Object.values(breakdownMap).reduce((a, b) => a + b, 0)

  // School-specific recent jobs (3 per school)
  const schoolJobs = await Promise.all(
    SCHOOLS.map(s => prisma.job.findMany({
      where: { isActive: true, isApproved: true, filiere: s.filiere, NOT: [{ source: 'adzuna' }] },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: JOB_SELECT,
    }))
  )

  // Serialize dates for client consumption
  type SerializedJob = Omit<typeof recentJobs[0], 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }
  const serializeJob = (j: typeof recentJobs[0]): SerializedJob => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  })

  const recentSerialized = recentJobs.map(serializeJob)
  const schoolJobsSerialized = schoolJobs.map(arr => arr.map(serializeJob))

  const userName   = session?.user?.name ?? null
  const userSchool = (session?.user as { school?: string | null } | undefined)?.school ?? null

  return (
    <div className="min-h-screen bg-light">
      <PublicNavbar
        isLoggedIn={!!session?.user}
        userName={userName}
        userSchool={userSchool}
        currentPath="/"
      />

      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Trouvez votre alternance ou stage
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Des offres sélectionnées pour les étudiants ACE Education Group
          </p>

          {/* Search bar — client component */}
          <HomeSearchBar />

          {/* School pill links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {SCHOOLS.map(s => (
              <Link key={s.key} href={`/jobboard/school/${s.key}`}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20">
                {s.label}
              </Link>
            ))}
          </div>

          <p className="text-white/50 text-sm mt-4">
            Vous êtes étudiant ACE ?{' '}
            <Link href="/register" className="text-white underline hover:text-white/80 transition-colors">
              Créez votre compte gratuitement →
            </Link>
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-navy/90 border-t border-white/10 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">{totalJobs}</div>
              <div className="text-xs text-white/50">Offres totales</div>
            </div>
            {SCHOOLS.map((s, i) => (
              <div key={s.key} className="text-center">
                <div className="text-2xl font-extrabold text-white">{schoolCounts[i] ?? 0}</div>
                <div className="text-xs text-white/50">{s.filiere}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent offers */}
      <section className="py-14 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-navy mb-8">Offres récentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentSerialized.map(job => (
              <JobCard key={job.id} job={job as unknown as Job} savedJobIds={[]} isAuthenticated={!!session?.user} publicMode />
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-teal text-teal hover:bg-teal/5">
              <Link href="/jobboard">Voir toutes les offres →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Per-school sections */}
      {SCHOOLS.map((s, i) => (
        <section key={s.key} className={i % 2 === 0 ? 'py-12 bg-white' : 'py-12 bg-light'}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-navy">{s.filiere}</h2>
                <p className="text-sm text-gray-400">{schoolCounts[i]} offre{schoolCounts[i] !== 1 ? 's' : ''}</p>
              </div>
              <Link href={`/jobboard/school/${s.key}`} className="text-sm text-teal font-semibold hover:underline">
                Voir tout →
              </Link>
            </div>
            {schoolJobsSerialized[i].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolJobsSerialized[i].map(job => (
                  <JobCard key={job.id} job={job as unknown as Job} savedJobIds={[]} isAuthenticated={!!session?.user} publicMode />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Aucune offre disponible pour le moment.</p>
            )}
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer className="bg-navy py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/40 text-xs">
            <Image src="/ace-logo.png" alt="ACE" width={80} height={26} className="h-6 w-auto opacity-60 mb-1" />
            © {new Date().getFullYear()} ACE Education Group
          </div>
          <div className="flex gap-6 text-sm text-white/50">
            <Link href="/jobboard" className="hover:text-white transition-colors">Jobboard</Link>
            <Link href="/login" className="hover:text-white transition-colors">Se connecter</Link>
            <Link href="/register" className="hover:text-white transition-colors">S&apos;inscrire</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
