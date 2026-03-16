import Link from "next/link"
import { Job } from "@/types/job"
import SaveButton from "@/components/ui/save-button"
import AvatarCircle from "@/components/ui/avatar-circle"
import { relativeTime } from "@/lib/utils"

interface JobCardProps {
  job: Job
  savedJobIds?: string[]
  isAuthenticated?: boolean
  publicMode?: boolean
}

const filiereBadgeColors: Record<string, string> = {
  "Sport Management":        "bg-green-50 text-green-700 ring-green-100",
  "Hôtellerie & Luxe":       "bg-blue-50 text-blue-900 ring-blue-200",
  "Mode & Luxe":             "bg-purple-50 text-purple-700 ring-purple-100",
  Design:                    "bg-orange-50 text-orange-700 ring-orange-100",
  "Illustration & Animation": "bg-red-50 text-red-700 ring-red-100",
}

const filiereAccentBorder: Record<string, string> = {
  "Sport Management":        "border-t-green-500",
  "Hôtellerie & Luxe":       "border-t-blue-900",
  "Mode & Luxe":             "border-t-purple-500",
  Design:                    "border-t-orange-500",
  "Illustration & Animation": "border-t-red-500",
}

const contractBadgeColors: Record<string, string> = {
  Alternance: "bg-green-50 text-green-700 ring-green-100",
  Stage: "bg-orange-50 text-orange-700 ring-orange-100",
  Apprentissage: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  "Contrat de professionnalisation": "bg-teal-50 text-teal-700 ring-teal-100",
}

const SOURCE_BADGES: Record<string, { label: string; className: string }> = {
  wttj:     { label: 'WTTJ',     className: 'bg-orange-100 text-orange-700' },
  linkedin: { label: 'LinkedIn', className: 'bg-blue-100 text-blue-700' },
  indeed:   { label: 'Indeed',   className: 'bg-green-100 text-green-700' },
}

export default function JobCard({
  job,
  savedJobIds = [],
  isAuthenticated = false,
  publicMode = false,
}: JobCardProps) {
  const badgeColors = filiereBadgeColors[job.filiere] || "bg-gray-50 text-gray-700 ring-gray-100"
  const contractColors = contractBadgeColors[job.contractType] || "bg-gray-50 text-gray-700 ring-gray-100"
  const accentBorder = filiereAccentBorder[job.filiere] || "border-t-gray-300"
  const isSaved = savedJobIds.includes(job.id)
  const sourceBadge = SOURCE_BADGES[job.source]
  const locationDisplay = job.location.length > 25 ? job.location.slice(0, 25) + '…' : job.location

  return (
    <div
      className={`rounded-2xl bg-white border border-gray-100 border-t-4 ${accentBorder} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col`}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Header: avatar + title + save + source badge */}
        <div className="flex items-start gap-3 mb-4">
          <AvatarCircle name={job.company} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
                {job.title}
              </h3>
              {sourceBadge && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${sourceBadge.className}`}>
                  {sourceBadge.label}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate font-medium">{job.company}</p>
          </div>
          <SaveButton
            jobId={job.id}
            initialSaved={isSaved}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${badgeColors}`}>
            {job.filiere}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${contractColors}`}>
            {job.contractType}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-gray-100 bg-gray-50 text-gray-600">
            {job.niveau}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{locationDisplay}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed flex-1">
          {job.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-5 py-3.5 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {relativeTime(job.createdAt)}
        </span>
        <Link
          href={publicMode ? `/jobboard/${job.id}` : `/offers/${job.id}`}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-teal hover:bg-teal-hover text-white transition-colors duration-150"
        >
          Voir l&apos;offre →
        </Link>
      </div>
    </div>
  )
}
