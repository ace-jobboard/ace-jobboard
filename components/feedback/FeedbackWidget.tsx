"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { X, MessageSquarePlus, Loader2, Bug, Lightbulb } from 'lucide-react'

export default function FeedbackWidget() {
  const pathname = usePathname()
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [type, setType] = useState<'bug' | 'suggestion'>('suggestion')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // Hide everything on admin pages
  if (pathname.startsWith('/admin')) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < 5) {
      toast.error('Veuillez écrire un message plus détaillé')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, email, page: pathname }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Erreur')
      }
      toast.success('Merci pour votre retour !')
      setModalOpen(false)
      setMessage('')
      setEmail('')
      setType('suggestion')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Beta banner ─────────────────────────────────────────────────────── */}
      {!bannerDismissed && (
        <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-xs text-amber-800 z-50">
          <span className="flex items-center gap-2">
            <span className="font-semibold">🧪 Version bêta</span>
            <span className="hidden sm:inline text-amber-700">
              — Cette plateforme est en phase de test. Certaines fonctionnalités peuvent évoluer.
            </span>
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="font-semibold underline underline-offset-2 hover:text-amber-900 transition-colors"
            >
              Donner mon avis
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-amber-600 hover:text-amber-900 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating feedback button ─────────────────────────────────────────── */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-navy text-white text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-lg hover:bg-navy/90 transition-all duration-150"
        aria-label="Signaler un bug ou faire une suggestion"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="hidden sm:inline">Votre avis</span>
      </button>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Votre avis compte</h2>
                <p className="text-xs text-gray-500 mt-0.5">Bug, suggestion ou commentaire — tout nous aide !</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    type === 'bug'
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Bug className="w-4 h-4" />
                  Bug
                </button>
                <button
                  type="button"
                  onClick={() => setType('suggestion')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    type === 'suggestion'
                      ? 'border-teal bg-teal/5 text-teal'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  Suggestion
                </button>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {type === 'bug' ? 'Décrivez le problème' : 'Votre suggestion'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === 'bug'
                      ? 'Que s\'est-il passé ? Sur quelle page ?'
                      : 'Qu\'est-ce qui pourrait être amélioré ?'
                  }
                  rows={4}
                  required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all resize-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email <span className="text-gray-400 font-normal">(optionnel — pour qu&apos;on puisse vous répondre)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || message.trim().length < 5}
                className="w-full flex items-center justify-center gap-2 bg-navy text-white text-sm font-semibold rounded-xl py-2.5 transition-all disabled:opacity-50 hover:bg-navy/90"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
