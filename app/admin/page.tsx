import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import AdminSyncButton from '@/components/admin/AdminSyncButton'
import AdminAlertsSection from '@/components/admin/AdminAlertsSection'
import Link from 'next/link'
import { Users, Briefcase, Clock, CheckCircle2 } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if ((session.user as { role?: string }).role !== 'ADMIN') redirect('/dashboard')

  const [totalJobs, approvedJobs, pendingJobs, totalUsers, recentRuns] = await Promise.all([
    prisma.job.count({ where: { isActive: true, filiere: { not: '_dump' } } }),
    prisma.job.count({ where: { isActive: true, isApproved: true, filiere: { not: '_dump' } } }),
    prisma.job.count({ where: { isActive: true, isApproved: false, filiere: { not: '_dump' } } }),
    prisma.user.count(),
    prisma.scrapeRun.findMany({ orderBy: { startedAt: 'desc' }, take: 5 }).catch(() => []),
  ])

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Vue d&apos;ensemble</h1>
          <p className="text-sm text-gray-500 mt-1">Tableau de bord administrateur</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Offres actives', value: totalJobs, icon: Briefcase, color: 'text-navy' },
            { label: 'Approuvées', value: approvedJobs, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'En attente', value: pendingJobs, icon: Clock, color: 'text-amber-500' },
            { label: 'Utilisateurs', value: totalUsers, icon: Users, color: 'text-teal' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <Icon className={`w-5 h-5 mb-3 ${color}`} />
              <div className="text-3xl font-extrabold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="font-semibold text-navy text-sm mb-1">Synchroniser les offres</p>
              <p className="text-xs text-gray-500 mb-1">Récupérer les dernières offres depuis Apify</p>
              <AdminSyncButton />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="font-semibold text-navy text-sm mb-1">Gérer les utilisateurs</p>
              <p className="text-xs text-gray-500 mb-3">Voir et gérer les comptes étudiants</p>
              <Link href="/admin/users" className="block w-full text-center px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors">Voir les utilisateurs →</Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="font-semibold text-navy text-sm mb-1">Gérer les offres</p>
              <p className="text-xs text-gray-500 mb-3">Approuver, filtrer et supprimer</p>
              <Link href="/offers" className="block w-full text-center px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors">Voir les offres →</Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="font-semibold text-navy text-sm mb-1">Tableau de bord</p>
              <p className="text-xs text-gray-500 mb-3">Statistiques et répartition par école</p>
              <Link href="/dashboard" className="block w-full text-center px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors">Voir les stats →</Link>
            </div>
          </div>
        </div>

        {/* Recent sync history */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Dernières synchronisations</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {recentRuns.length === 0 ? (
              <p className="text-sm text-gray-400 italic p-5">Aucune synchronisation effectuée.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Date', 'Trouvées', 'Sauvegardées', 'Filtrées', 'Durée', 'Statut'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentRuns.map(run => {
                    const durationSec = run.completedAt
                      ? Math.round((run.completedAt.getTime() - run.startedAt.getTime()) / 1000)
                      : null
                    const statusColor = run.status === 'SUCCEEDED' ? 'bg-green-100 text-green-700'
                      : run.status === 'RUNNING' ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                    return (
                      <tr key={run.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-700">{new Date(run.startedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-4 py-3 text-gray-700">{run.jobsFound ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{run.jobsSaved ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{run.jobsFiltered ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{durationSec != null ? `${durationSec}s` : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                            {run.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Email alerts section */}
        <AdminAlertsSection />
      </div>
    </AppShell>
  )
}
