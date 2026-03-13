"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import Filters from "@/components/Filters"
import JobCard from "@/components/JobCard"
import JobCardSkeleton from "@/components/JobCardSkeleton"
import UserNav from "@/components/auth/UserNav"
import { Button } from "@/components/ui/button"
import { Job, JobFilters } from "@/types/job"

const filiereLabels = [
  "Sport Management",
  "Hôtellerie & Luxe",
  "Mode & Luxe",
  "Design",
  "Illustration & Animation",
]

const filiereColors: Record<string, string> = {
  "Sport Management":        "text-green-600",
  "Hôtellerie & Luxe":       "text-blue-900",
  "Mode & Luxe":             "text-purple-600",
  "Design":                  "text-orange-500",
  "Illustration & Animation": "text-red-600",
}

export default function Home() {
  const { data: session, status } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [filters, setFilters] = useState<JobFilters>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.filiere) params.append("filiere", filters.filiere)
      if (filters.niveau) params.append("niveau", filters.niveau)
      if (filters.region) params.append("region", filters.region)
      if (filters.contractType) params.append("contractType", filters.contractType)
      if (filters.search) params.append("search", filters.search)
      params.append("limit", "9999") // load all jobs so filiere counts are accurate

      const response = await fetch(`/api/jobs?${params.toString()}`)
      if (!response.ok) throw new Error("Erreur lors du chargement des offres")

      const data = await response.json()
      const jobList = Array.isArray(data) ? data : (data.jobs ?? [])
      setJobs(jobList)
      setTotalJobs(data.total ?? jobList.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/saved-jobs")
        .then((r) => r.json())
        .then((savedJobs: Job[]) => setSavedJobIds(savedJobs.map((j) => j.id)))
        .catch(() => {})
    } else {
      setSavedJobIds([])
    }
  }, [session])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleFilterChange = (newFilters: JobFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const countByFiliere = (filiere: string) =>
    jobs.filter((j) => j.filiere === filiere).length

  return (
    <main className="min-h-screen bg-light">
      {/* Sticky header + filters */}
      <div className="sticky top-0 z-50">
        <header className="bg-navy text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/ace-logo.png"
                  alt="ACE Education"
                  width={160}
                  height={52}
                  className="h-11 w-auto object-contain"
                  priority
                />
                <div className="hidden md:block h-7 border-l border-white/20" />
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-white leading-tight">Job Board</p>
                  <p className="text-xs text-white/50">Stages · Alternances · Apprentissage</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {status === "authenticated" && session?.user ? (
                  <>
                    <UserNav user={session.user} />
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm text-white/70 hover:text-white transition-colors duration-150"
                    >
                      Connexion
                    </Link>
                    <Button asChild size="sm" className="bg-teal hover:bg-teal-hover text-white font-semibold transition-colors duration-150 cursor-pointer">
                      <Link href="/register">Créer un compte</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Sticky filter bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <Filters onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats — scrolls with content */}
        {!loading && !error && jobs.length > 0 && (
          <div className="animate-fade-up bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 hover:shadow-md transition-shadow duration-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Aperçu des offres
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="col-span-3 md:col-span-1 text-center md:border-r border-gray-100 md:pr-4">
                <div className="text-4xl font-extrabold text-gray-900 leading-none">{totalJobs}</div>
                <div className="text-xs text-gray-500 mt-1.5 font-medium">Offres disponibles</div>
              </div>
              {filiereLabels.map((f) => (
                <div key={f} className="text-center">
                  <div className={`text-2xl font-bold leading-none ${filiereColors[f] ?? "text-gray-700"}`}>
                    {countByFiliere(f)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1.5 leading-tight">{f}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading — skeleton grid */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Aucune offre trouvée</h3>
            <p className="mt-1 text-sm text-gray-400">
              Essayez de modifier vos filtres pour voir plus d&apos;opportunités
            </p>
          </div>
        )}

        {/* Job grid */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job, i) => (
              <div
                key={job.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <JobCard
                  job={job}
                  savedJobIds={savedJobIds}
                  isAuthenticated={status === "authenticated"}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-navy text-white/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <Image
            src="/ace-logo.png"
            alt="ACE Education"
            width={100}
            height={32}
            className="h-8 w-auto object-contain mx-auto mb-3 opacity-60"
          />
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} ACE Education &mdash; AMOS &bull; CMH &bull; EIDM
            &bull; ESDAC &bull; ENAAI
          </p>
          <p className="text-xs mt-1 text-white/30">
            Plateforme d&apos;offres de stages et alternances pour les étudiants ACE
          </p>
        </div>
      </footer>
    </main>
  )
}
