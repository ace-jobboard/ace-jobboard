'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  jobId: string
  isLoggedIn: boolean
  initialApplied: boolean
}

export default function ApplyButton({ jobId, isLoggedIn, initialApplied }: Props) {
  const [applied, setApplied] = useState(initialApplied)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!isLoggedIn) {
      router.push(`/register?redirect=/jobboard/${jobId}`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: 'POST' })
      const data = await res.json() as { applied: boolean }
      setApplied(data.applied)
      toast.success(data.applied ? 'Candidature enregistrée ✓' : 'Candidature retirée')
    } catch {
      toast.error('Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}
      className={applied
        ? 'w-full border border-teal text-teal bg-teal/5 hover:bg-teal/10 font-semibold'
        : 'w-full bg-navy hover:bg-navy/90 text-white font-semibold'
      }
      variant={applied ? 'outline' : 'default'}
    >
      {applied ? <><CheckCircle2 className="w-4 h-4 mr-2" />Postulé ✓</> : <><Send className="w-4 h-4 mr-2" />Marquer comme postulé</>}
    </Button>
  )
}
