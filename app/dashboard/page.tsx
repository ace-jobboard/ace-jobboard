import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import KpiCard from "@/components/ui/kpi-card"
import StatusBadge from "@/components/ui/status-badge"
import { Briefcase, CheckCircle, Clock, RefreshCw, Globe } from "lucide-react"
import DashboardCharts from "@/components/dashboard/DashboardCharts"
import { APIFY_TASKS } from "@/config/tasks"
import Link from "next/link"

type RecommendedJob = {
  id: string; title: string; company: string; location: string | null
  filiere: string; contractType: string; createdAt: Date; source: string
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isAdmin = (session.user as { role?: string }).role === "ADMIN"

  const userId = session.user.id

  const [totalJobs, activeJobs, pendingApproval, scrapeRuns] = await Promise.all([
    prisma.job.count({ where: { filiere: { not: "_dump" } } }),
    prisma.job.count({ where: { isActive: true, filiere: { not: "_dump" } } }),
    prisma.job.count({ where: { isApproved: false, filiere: { not: "_dump" } } }),
    prisma.scrapeRun.findFirst({ orderBy: { completedAt: "desc" } }),
  ])

  const [byFiliere, byContract, bySources, recentRuns] = await Promise.all([
    prisma.job.groupBy({
      by: ["filiere"],
      _count: true,
      where: { isActive: true, filiere: { not: "_dump" } },
    }),
    prisma.job.groupBy({
      by: ["contractType"],
      _count: true,
      where: { isActive: true, filiere: { not: "_dump" } },
    }),
    prisma.job.groupBy({
      by: ["source"],
      _count: true,
      where: { isActive: true, filiere: { not: "_dump" } },
    }),
    prisma.scrapeRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ])

  // Fetch user's school for recommendations
  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { school: true } })
  const userSchool = dbUser?.school ?? null

  let recommendedJobs: RecommendedJob[] = []
  if (userSchool) {
    const [savedJobIds, applicationJobIds] = await Promise.all([
      prisma.savedJob.findMany({ where: { userId }, select: { jobId: true } }),
      prisma.jobApplication.findMany({ where: { userId }, select: { jobId: true } }).catch(() => []),
    ])
    const excludeIds = [
      ...savedJobIds.map(s => s.jobId),
      ...applicationJobIds.map(a => a.jobId),
    ]
    recommendedJobs = await prisma.job.findMany({
      where: {
        isActive: true,
        isApproved: true,
        filiere: userSchool,
        id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true, title: true, company: true, location: true, filiere: true,
        contractType: true, createdAt: true, source: true,
      },
    })
  }

  const lastUpdated = scrapeRuns?.completedAt
    ? new Date(scrapeRuns.completedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "Never"

  const activeSources = bySources.map((s) => s.source.toUpperCase()).join(", ") || "—"

  // Group tasks by source
  const tasksBySource = APIFY_TASKS.reduce<Record<string, typeof APIFY_TASKS>>((acc, task) => {
    if (!acc[task.source]) acc[task.source] = []
    acc[task.source].push(task)
    return acc
  }, {})

  function statusVariant(status: string): "green" | "orange" | "red" {
    if (status === "success") return "green"
    if (status === "partial") return "orange"
    return "red"
  }

  function formatDuration(startedAt: Date, completedAt: Date | null): string {
    if (!completedAt) return "—"
    const secs = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
    if (secs < 60) return `${secs}s`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }

  return (
    <AppShell title="Dashboard" userName={session.user.name ?? "Admin"}>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard icon={Briefcase}    label="Total offers"      value={totalJobs} />
        <KpiCard icon={CheckCircle}  label="Active offers"     value={activeJobs}      iconColor="text-emerald-500" />
        <KpiCard icon={Clock}        label="Pending approval"  value={pendingApproval} iconColor="text-amber-500" />
        <KpiCard icon={RefreshCw}    label="Last updated"      value={lastUpdated}     iconColor="text-purple-500" />
        <KpiCard icon={Globe}        label="Active sources"    value={activeSources}   iconColor="text-blue-500" />
      </div>

      {/* Charts */}
      <DashboardCharts
        byFiliere={byFiliere.map((r) => ({ filiere: r.filiere, count: r._count }))}
        byContract={byContract.map((r) => ({ contractType: r.contractType, count: r._count }))}
      />

      {/* Scraping pipeline table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">Scraping pipeline</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400 bg-gray-50">
                <th className="px-5 py-3 text-left">Source</th>
                <th className="px-5 py-3 text-left">School</th>
                <th className="px-5 py-3 text-left">Keyword</th>
                <th className="px-5 py-3 text-left">Task ID</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(["wttj", "linkedin", "indeed"] as const).map((src) => {
                const srcTasks = tasksBySource[src] ?? []
                if (srcTasks.length === 0) return null
                return srcTasks.map((task, i) => (
                  <tr key={`${task.source}-${task.school}-${i}`} className="hover:bg-gray-50 transition-colors">
                    {i === 0 && (
                      <td className="px-5 py-3" rowSpan={srcTasks.length}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          src === "linkedin" ? "bg-blue-50 text-blue-700"
                          : src === "indeed" ? "bg-violet-50 text-violet-700"
                          : "bg-orange-50 text-orange-700"
                        }`}>
                          {src.toUpperCase()}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-3 font-medium text-gray-700">{task.school}</td>
                    <td className="px-5 py-3 text-gray-500">{task.keyword}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{task.taskId.slice(-8)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge label="Active" variant="green" />
                    </td>
                  </tr>
                ))
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync history */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">Historique de synchronisation</h2>
          {isAdmin && (
            <Link href="/admin" className="text-xs text-teal hover:underline">Voir tout →</Link>
          )}
        </div>
        <div className="overflow-x-auto">
          {recentRuns.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 py-4">Aucun historique de synchronisation.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-400 bg-gray-50">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Offres trouvées</th>
                  <th className="px-5 py-3 text-left">Sauvegardées</th>
                  <th className="px-5 py-3 text-left">Filtrées</th>
                  <th className="px-5 py-3 text-left">Durée</th>
                  <th className="px-5 py-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(run.startedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{run.jobsFound}</td>
                    <td className="px-5 py-3 text-gray-700">{run.jobsSaved}</td>
                    <td className="px-5 py-3 text-gray-700">{run.jobsFiltered}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {formatDuration(run.startedAt, run.completedAt ?? null)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        label={run.status}
                        variant={statusVariant(run.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Recommended jobs */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-navy mb-4">
          Offres recommandées pour vous
          {userSchool && <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{userSchool}</span>}
        </h2>
        {!userSchool ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Complétez votre profil pour voir des recommandations personnalisées.</p>
            <Link href="/dashboard/profile" className="text-teal text-sm font-semibold hover:underline">Compléter mon profil →</Link>
          </div>
        ) : recommendedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Toutes les offres de votre école ont déjà été vues !</p>
            <Link href="/jobboard" className="text-teal text-sm font-semibold hover:underline">Parcourir toutes les offres →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map(job => (
              <Link key={job.id} href={`/offers/${job.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <p className="font-semibold text-navy text-sm truncate">{job.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-navy/5 text-navy">{job.contractType}</span>
                  {job.location && <span className="text-xs text-gray-400 truncate">{job.location}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
