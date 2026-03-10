import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import KpiCard from "@/components/ui/kpi-card"
import { Briefcase, CheckCircle, School, RefreshCw, Globe } from "lucide-react"
import DashboardCharts from "@/components/dashboard/DashboardCharts"
import { APIFY_TASKS } from "@/config/tasks"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [totalJobs, activeJobs, scrapeRuns] = await Promise.all([
    prisma.job.count({ where: { filiere: { not: "_dump" } } }),
    prisma.job.count({ where: { isActive: true, filiere: { not: "_dump" } } }),
    prisma.scrapeRun.findFirst({ orderBy: { completedAt: "desc" } }),
  ])

  const byFiliere = await prisma.job.groupBy({
    by: ["filiere"],
    _count: true,
    where: { isActive: true, filiere: { not: "_dump" } },
  })

  const byContract = await prisma.job.groupBy({
    by: ["contractType"],
    _count: true,
    where: { isActive: true, filiere: { not: "_dump" } },
  })

  const bySources = await prisma.job.groupBy({
    by: ["source"],
    _count: true,
    where: { isActive: true, filiere: { not: "_dump" } },
  })

  const schools = new Set(byFiliere.map((r) => r.filiere).filter((f) => f !== "_dump"))

  const lastUpdated = scrapeRuns?.completedAt
    ? new Date(scrapeRuns.completedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "Never"

  const activeSources = bySources.map((s) => s.source.toUpperCase()).join(", ") || "—"

  return (
    <AppShell title="Dashboard" userName={session.user.name ?? "Admin"}>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard icon={Briefcase}    label="Total offers"    value={totalJobs} />
        <KpiCard icon={CheckCircle}  label="Active offers"   value={activeJobs} iconColor="text-emerald-500" />
        <KpiCard icon={School}       label="Schools"         value={schools.size} iconColor="text-purple-500" />
        <KpiCard icon={RefreshCw}    label="Last updated"    value={lastUpdated} iconColor="text-amber-500" />
        <KpiCard icon={Globe}        label="Active sources"  value={activeSources} iconColor="text-blue-500" />
      </div>

      {/* Charts */}
      <DashboardCharts
        byFiliere={byFiliere.map((r) => ({ filiere: r.filiere, count: r._count }))}
        byContract={byContract.map((r) => ({ contractType: r.contractType, count: r._count }))}
      />

      {/* Scraping activity table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wide">Scraping activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400 bg-gray-50">
                <th className="px-5 py-3 text-left">Source</th>
                <th className="px-5 py-3 text-left">School</th>
                <th className="px-5 py-3 text-left">Keyword</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {APIFY_TASKS.map((task) => (
                <tr key={task.taskId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${task.source === "linkedin" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>
                      {task.source.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-700">{task.school}</td>
                  <td className="px-5 py-3 text-gray-500">{task.keyword}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
