import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import AvatarCircle from "@/components/ui/avatar-circle"
import StatusBadge from "@/components/ui/status-badge"
import Link from "next/link"
import OfferActions from "@/components/offers/OfferActions"
import OfferMemo from "@/components/offers/OfferMemo"

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) notFound()

  const posted = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : new Date(job.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

  const chips = [
    { label: job.filiere,               variant: "teal"  as const },
    { label: job.contractType,          variant: "grey"  as const },
    { label: job.source.toUpperCase(),  variant: job.source === "linkedin" ? "blue" as const : "orange" as const },
    { label: posted,                    variant: "navy"  as const },
  ]

  return (
    <AppShell title="Offer detail" userName={session.user.name ?? "Admin"}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/offers" className="hover:text-navy transition-colors">← Offers</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{job.title}</span>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <AvatarCircle name={job.company} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-navy">{job.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{job.company}</p>
              </div>
            </div>

            {/* Chips row */}
            <div className="flex flex-wrap gap-2 mb-6">
              {chips.map((chip, i) => (
                <StatusBadge key={i} label={chip.label} variant={chip.variant} />
              ))}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Contract</span><span className="font-medium">{job.contractType}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Location</span><span className="font-medium">{job.location || "—"}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Level</span><span className="font-medium">{job.niveau}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Region</span><span className="font-medium">{job.region}</span></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">School</span><StatusBadge label={job.filiere} variant="teal" /></div>
              <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Source</span><StatusBadge label={job.source.toUpperCase()} variant={job.source === "linkedin" ? "blue" : "orange"} /></div>
              {job.salary && (
                <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Salary</span><span className="font-medium">{job.salary}</span></div>
              )}
              {job.expiresAt && (
                <div><span className="text-gray-400 block text-xs uppercase tracking-wide mb-1">Expires</span><span className="font-medium">{new Date(job.expiresAt).toLocaleDateString("fr-FR")}</span></div>
              )}
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <StatusBadge key={tag} label={tag} variant="grey" />
                ))}
              </div>
            )}
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
          {/* Actions card */}
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Actions</h3>
            <OfferActions
              id={job.id}
              url={job.applyUrl ?? job.url}
              isApproved={job.isApproved}
            />
          </div>

          {/* Info card */}
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">ID</dt><dd className="font-mono text-xs text-gray-600">{job.id.slice(0, 12)}…</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Task ID</dt><dd className="font-mono text-xs text-gray-600">{(job.taskId ?? job.apifyActorId)?.slice(-8) ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Source</dt><dd className="text-gray-600">{job.source.toUpperCase()}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">First seen</dt><dd className="text-gray-600">{new Date(job.firstSeenAt).toLocaleDateString("fr-FR")}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Last seen</dt><dd className="text-gray-600">{new Date(job.lastSeenAt).toLocaleDateString("fr-FR")}</dd></div>
            </dl>
          </div>

          {/* Memo card */}
          <OfferMemo id={job.id} initialMemo={job.memo ?? ""} />
        </div>
      </div>
    </AppShell>
  )
}
