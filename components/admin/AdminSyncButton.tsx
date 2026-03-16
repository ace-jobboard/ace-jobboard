'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminSyncButton() {
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    const t = toast.loading('Synchronisation en cours…')
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = await res.json() as { totals?: { saved?: number; duplicates?: number; filtered?: number } }
      toast.dismiss(t)
      if (res.ok) {
        const { totals } = data
        toast.success(`Sync terminée`, {
          description: `${totals?.saved ?? 0} sauvegardées · ${totals?.duplicates ?? 0} doublons · ${totals?.filtered ?? 0} filtrées`,
        })
      } else {
        toast.error('Erreur lors de la synchronisation')
      }
    } catch {
      toast.dismiss(t)
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} className="bg-teal hover:bg-teal-hover text-white font-semibold w-full mt-3">
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Synchronisation…' : 'Lancer la sync →'}
    </Button>
  )
}
