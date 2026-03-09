import { prisma } from "@/lib/db"

const filieres = [
  "Sport Management",
  "Hôtellerie & Luxe",
  "Mode & Luxe",
  "Design",
  "Illustration & Animation",
]

const filiereColors: Record<string, string> = {
  "Sport Management":         "text-green-600",
  "Hôtellerie & Luxe":        "text-blue-900",
  "Mode & Luxe":              "text-purple-600",
  "Design":                   "text-orange-500",
  "Illustration & Animation": "text-red-600",
}

export default async function AdminPage() {
  const [activeJobs, hiddenJobs, totalUsers, recentJobs, filiereCounts] = await Promise.all([
    prisma.job.count({ where: { isActive: true } }),
    prisma.job.count({ where: { isActive: false } }),
    prisma.user.count(),
    prisma.job.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.job.groupBy({
      by: ["filiere"],
      where: { isActive: true },
      _count: { _all: true },
    }),
  ])

  const countMap: Record<string, number> = {}
  for (const g of filiereCounts) countMap[g.filiere] = g._count._all

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Vue d&apos;ensemble</h1>
      <p className="text-sm text-gray-500 mb-8">Tableau de bord administrateur</p>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Offres actives" value={activeJobs} color="text-gray-900" />
        <StatCard label="Offres masquées" value={hiddenJobs} color="text-gray-400" />
        <StatCard label="Utilisateurs" value={totalUsers} color="text-blue-600" />
        <StatCard label="Nouvelles (7j)" value={recentJobs} color="text-green-600" />
      </div>

      {/* By filiere */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Offres actives par filière
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filieres.map((f) => (
          <div key={f} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`text-3xl font-extrabold leading-none ${filiereColors[f] ?? "text-gray-700"}`}>
              {countMap[f] ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-2 leading-tight">{f}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className={`text-3xl font-extrabold leading-none ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1.5 font-medium">{label}</div>
    </div>
  )
}
