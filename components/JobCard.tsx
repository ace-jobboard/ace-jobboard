import { Job } from "@/types/job"
import SaveButton from "@/components/ui/save-button"

interface JobCardProps {
  job: Job
  savedJobIds?: string[]
  isAuthenticated?: boolean
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

const filiereAvatarBg: Record<string, string> = {
  "Sport Management":        "bg-green-600",
  "Hôtellerie & Luxe":       "bg-blue-900",
  "Mode & Luxe":             "bg-purple-600",
  Design:                    "bg-orange-500",
  "Illustration & Animation": "bg-red-600",
}

const contractBadgeColors: Record<string, string> = {
  Alternance: "bg-green-50 text-green-700 ring-green-100",
  Stage: "bg-orange-50 text-orange-700 ring-orange-100",
  Apprentissage: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  "Contrat de professionnalisation": "bg-teal-50 text-teal-700 ring-teal-100",
}

export default function JobCard({
  job,
  savedJobIds = [],
  isAuthenticated = false,
}: JobCardProps) {
  const badgeColors = filiereBadgeColors[job.filiere] || "bg-gray-50 text-gray-700 ring-gray-100"
  const contractColors = contractBadgeColors[job.contractType] || "bg-gray-50 text-gray-700 ring-gray-100"
  const accentBorder = filiereAccentBorder[job.filiere] || "border-t-gray-300"
  const avatarBg = filiereAvatarBg[job.filiere] || "bg-gray-500"
  const isSaved = savedJobIds.includes(job.id)

  return (
    <div
      className={`rounded-2xl bg-white border border-gray-100 border-t-4 ${accentBorder} shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col`}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Header: avatar + title + save */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 ${avatarBg}`}
          >
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {job.title}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{job.company}</p>
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
          <span>{job.location}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">
          {job.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-5 py-3 border-t border-gray-50">
        <span className="text-xs text-gray-300">
          {new Date(job.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })}
        </span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition-colors"
        >
          Postuler →
        </a>
      </div>
    </div>
  )
}
