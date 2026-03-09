"use client"

import { useState } from "react"
import { Bookmark, Trash2, ExternalLink, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Job } from "@/types/job"

interface SavedJob extends Job {
  savedAt: Date | string
}

// Matches main site JobCard colors exactly
const filiereBadgeColors: Record<string, string> = {
  "Sport Management":         "bg-green-50 text-green-700 ring-green-100",
  "Hôtellerie & Luxe":        "bg-blue-50 text-blue-900 ring-blue-200",
  "Mode & Luxe":              "bg-purple-50 text-purple-700 ring-purple-100",
  Design:                     "bg-orange-50 text-orange-700 ring-orange-100",
  "Illustration & Animation": "bg-red-50 text-red-700 ring-red-100",
}

const filiereAccentBorder: Record<string, string> = {
  "Sport Management":         "border-t-green-500",
  "Hôtellerie & Luxe":        "border-t-blue-900",
  "Mode & Luxe":              "border-t-purple-500",
  Design:                     "border-t-orange-500",
  "Illustration & Animation": "border-t-red-500",
}

const filiereAvatarBg: Record<string, string> = {
  "Sport Management":         "bg-green-600",
  "Hôtellerie & Luxe":        "bg-blue-900",
  "Mode & Luxe":              "bg-purple-600",
  Design:                     "bg-orange-500",
  "Illustration & Animation": "bg-red-600",
}

const contractBadgeColors: Record<string, string> = {
  Alternance:                        "bg-green-50 text-green-700 ring-green-100",
  Stage:                             "bg-orange-50 text-orange-700 ring-orange-100",
  Apprentissage:                     "bg-cyan-50 text-cyan-700 ring-cyan-100",
  "Contrat de professionnalisation": "bg-teal-50 text-teal-700 ring-teal-100",
}

export default function SavedJobsGrid({ initialJobs }: { initialJobs: SavedJob[] }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleRemove(jobId: string) {
    setRemoving(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, { method: "POST" })
      if (!response.ok) throw new Error()
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
      toast.success("Offre retirée de vos favoris")
    } catch {
      toast.error("Erreur lors de la suppression")
    } finally {
      setRemoving(null)
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-up">
        <div className="mx-auto w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Bookmark className="w-7 h-7 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Aucune offre sauvegardée</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
          Cliquez sur le cœur d&apos;une offre pour la retrouver ici
        </p>
        <a
          href="/"
          className="inline-block mt-6 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Explorer les offres
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {jobs.map((job, i) => {
        const badgeColors   = filiereBadgeColors[job.filiere]   || "bg-gray-50 text-gray-700 ring-gray-100"
        const contractColors = contractBadgeColors[job.contractType] || "bg-gray-50 text-gray-700 ring-gray-100"
        const accentBorder  = filiereAccentBorder[job.filiere]  || "border-t-gray-300"
        const avatarBg      = filiereAvatarBg[job.filiere]      || "bg-gray-500"

        return (
          <div
            key={job.id}
            className="animate-fade-up rounded-2xl bg-white border border-gray-100 border-t-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
            style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
          >
            <div className={`rounded-t-2xl border-t-4 ${accentBorder}`} />
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 ${avatarBg}`}>
                  {job.company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{job.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{job.company}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${badgeColors}`}>{job.filiere}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${contractColors}`}>{job.contractType}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-gray-100 bg-gray-50 text-gray-600">{job.niveau}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{job.location}</span>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">{job.description}</p>
            </div>

            <div className="flex gap-2 px-5 py-3 border-t border-gray-50">
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-900 hover:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Postuler →
              </a>
              <button
                onClick={() => handleRemove(job.id)}
                disabled={removing === job.id}
                className="px-2.5 py-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
