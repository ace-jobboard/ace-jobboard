// Public offer detail — no auth required
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { sanitizeHtml } from '@/lib/sanitize'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, Building2, ExternalLink, ArrowLeft } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id }, select: { title: true, company: true } })
  if (!job) return { title: 'Offre introuvable' }
  return { title: `${job.title} — ${job.company} | ACE Job Board` }
}

export default async function PublicOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || !job.isActive) notFound()

  const sanitized = job.description ? sanitizeHtml(job.description) : null

  return (
    <div className="min-h-screen bg-light">
      {/* Simple navbar */}
      <header className="bg-navy text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Image src="/ace-logo.png" alt="ACE Education" width={120} height={40} className="h-9 w-auto object-contain" />
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Se connecter →</Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back */}
        <Link href="/jobboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour au jobboard
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-navy mb-1">{job.title}</h1>
              <p className="text-gray-600 font-medium">{job.company}</p>
            </div>
          </div>
          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy/5 text-navy text-sm font-medium">
              <Briefcase className="w-3.5 h-3.5" />{job.contractType}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal/10 text-teal text-sm font-medium">
              {job.filiere}
            </span>
            {job.location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm">
                <MapPin className="w-3.5 h-3.5" />{job.location}
              </span>
            )}
            {job.source && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium uppercase">
                {job.source}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Description du poste</h2>
              {sanitized ? (
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: sanitized }} />
              ) : (
                <p className="text-gray-400 italic text-sm">Aucune description disponible.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Postuler</h3>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-teal hover:bg-teal-hover text-white font-semibold">
                    Voir l&apos;offre originale <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
              )}
            </div>

            {/* CTA for non-logged-in users */}
            <div className="bg-navy rounded-2xl p-5 text-white">
              <Building2 className="w-6 h-6 text-teal mb-3" />
              <h3 className="font-semibold mb-1">Rejoignez la plateforme ACE</h3>
              <p className="text-white/60 text-sm mb-4">Accédez à toutes les offres et sauvegardez vos favoris.</p>
              <Link href="/register">
                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
