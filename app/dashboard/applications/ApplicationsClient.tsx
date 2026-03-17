'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Briefcase, MapPin } from 'lucide-react'

const STATUS_OPTIONS = ['applied', 'interview', 'offer', 'rejected'] as const
const STATUS_LABELS: Record<string, string> = {
  applied:   'Postulé',
  interview: 'Entretien',
  offer:     'Offre reçue',
  rejected:  'Refusé',
}
const STATUS_COLORS: Record<string, string> = {
  applied:   'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700',
  offer:     'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
}

const STATUS_OPTIONS_FILTER = ['all', 'applied', 'interview', 'offer', 'rejected'] as const

interface Application {
  id: string; jobId: string; appliedAt: string; status: string; notes: string | null
  job: { id: string; title: string; company: string; location: string; filiere: string; contractType: string; url: string }
}

export default function ApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [applications, setApplications] = useState(initial)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = statusFilter === 'all' ? applications : applications.filter(a => a.status === statusFilter)

  async function updateStatus(jobId: string, status: string) {
    try {
      await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setApplications(prev => prev.map(a => a.jobId === jobId ? { ...a, status } : a))
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-2">Mes candidatures</h1>
      <p className="text-sm text-gray-400 mb-4">
        {applications.length} candidature{applications.length !== 1 ? 's' : ''}
        {' · '}{applications.filter(a => a.status === 'interview').length} entretien
        {' · '}{applications.filter(a => a.status === 'offer').length} offre reçue
      </p>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 mb-4">Aucune candidature pour le moment.</p>
          <Link href="/jobboard" className="text-teal font-semibold hover:underline">Parcourir les offres →</Link>
        </div>
      ) : (
        <>
          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {STATUS_OPTIONS_FILTER.map(s => {
              const count = s === 'all' ? applications.length : applications.filter(a => a.status === s).length
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s === 'all' ? 'Tous' : STATUS_LABELS[s]} ({count})
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {filtered.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{a.job.title}</p>
                  <p className="text-sm text-gray-500">{a.job.company}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{a.job.contractType}</span>
                    {a.job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.job.location}</span>}
                    <span>{new Date(a.appliedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <select
                  value={a.status}
                  onChange={e => updateStatus(a.jobId, e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[a.status] ?? a.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
