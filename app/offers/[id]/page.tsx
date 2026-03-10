import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import AvatarCircle from "@/components/ui/avatar-circle"
import StatusBadge from "@/components/ui/status-badge"
import KpiCard from "@/components/ui/kpi-card"
import { School, FileText, Globe, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import OfferActions from "@/components/offers/OfferActions"

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) notFound()

  const posted = new Date(job.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  })

  return (
    <AppShell title="Offer detail" userName={session.user.name ?? "Admin"}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/offers" className="hover:text-navy transition-colors">← Offers</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{job.title}</span>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={School}    label="School"        value={job.filiere} />
        <KpiCard icon={FileText}  label="Contract"      value={job.contractType} iconColor="text-amber-500" />
        <KpiCard icon={Globe}     label="Source"        value={job.source.toUpperCase()} iconColor="text-blue-500" />
        <KpiCard icon={Calendar}  label="Published"     value={posted} iconColor="text-purple-500" />
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-start gap-4 mb-6">
              <AvatarCircle name={job.company} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-navy">{job.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{job.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Contract</span><span className="font-medium">{job.contractType}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Location</span><span className="font-medium">{job.location}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Level</span><span className="font-medium">{job.niveau}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Region</span><span className="font-medium">{job.region}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">School</span><StatusBadge label={job.filiere} variant="teal" /></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Source</span><StatusBadge label={job.source.toUpperCase()} variant={job.source === "linkedin" ? "blue" : "orange"} /></div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-navy uppercase tracking-wide mb-4">Description</h2>
            <div
              className="prose prose-sm max-w-none text-gray-600 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>
        </div>

        {/* Right (40%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Actions</h3>
            <div className="space-y-2">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors"
              >
                <ExternalLink size={15} />
                View original offer
              </a>
              <OfferActions id={job.id} url={job.url} />
            </div>
          </div>

          {/* Tech info */}
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Technical info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Internal ID</dt><dd className="font-mono text-xs text-gray-600">{job.id.slice(0, 12)}…</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Apify task</dt><dd className="font-mono text-xs text-gray-600">{job.apifyActorId?.slice(0, 12) ?? "—"}…</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Last seen</dt><dd className="text-gray-600">{new Date(job.lastSeenAt).toLocaleDateString("fr-FR")}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
