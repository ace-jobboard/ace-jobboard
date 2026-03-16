'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, Eye, Send } from 'lucide-react'

interface AlertPreview {
  user: { id: string; email: string; name: string | null }
  matchingJobCount: number
  frequency: string
}

export default function AdminAlertsSection() {
  const [previews, setPreviews] = useState<AlertPreview[]>([])
  const [showPreviews, setShowPreviews] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  async function handlePreview() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/alerts/preview')
      const data = await res.json() as { previews?: AlertPreview[] }
      setPreviews(data.previews ?? [])
      setShowPreviews(true)
    } catch {
      toast.error('Erreur lors du chargement de l\'aperçu')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!confirm('Envoyer les alertes email ?')) return
    setSending(true)
    try {
      const res = await fetch('/api/admin/alerts/send', { method: 'POST' })
      const data = await res.json() as { sent?: number; skipped?: number; errors?: string[] }
      toast.success(`${data.sent} alerte(s) envoyée(s)`, {
        description: `${data.skipped} ignorée(s), ${data.errors?.length ?? 0} erreur(s)`,
      })
    } catch {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal" />
          <h2 className="text-sm font-semibold text-navy">Alertes email</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePreview} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:border-navy hover:text-navy disabled:opacity-50 transition-colors">
            <Eye className="w-3.5 h-3.5" />{loading ? 'Chargement…' : 'Aperçu'}
          </button>
          <button onClick={handleSend} disabled={sending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal text-white hover:bg-teal-hover disabled:opacity-50 transition-colors">
            <Send className="w-3.5 h-3.5" />{sending ? 'Envoi…' : 'Envoyer les alertes'}
          </button>
        </div>
      </div>
      {showPreviews && (
        <div className="space-y-1.5 mt-3">
          {previews.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun utilisateur avec des alertes activées.</p>
          ) : (
            previews.map(p => (
              <div key={p.user.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">{p.user.email}</span>
                <span className="text-xs text-gray-400">{p.matchingJobCount} offre(s) · {p.frequency}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
