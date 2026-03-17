"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import JobCard from "@/components/JobCard"
import EmptyState from "@/components/ui/empty-state"
import { Search, Loader2 } from "lucide-react"
import { Job } from "@/types/job"

interface SerializedJob {
  id: string
  title: string
  company: string
  description: string
  location: string
  filiere: string
  niveau: string
  region: string
  contractType: string
  url: string
  source: string
  isApproved: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Props {
  isLoggedIn: boolean
  userSchool: string | null
  initialJobs: SerializedJob[]
  initialTotal: number
  defaultSchool?: string
  hideHero?: boolean
}

const FILIERES = ["AMOS", "CMH", "EIDM", "ESDAC", "ENAAI"]
const CONTRACTS = ["Alternance", "Stage", "CDI", "CDD"]

function toJob(raw: SerializedJob): Job {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

function pill(
  options: string[],
  value: string,
  set: (v: string) => void,
  setPage: (p: number) => void,
  setLoadMore: (b: boolean) => void
) {
  return options.map((opt) => (
    <button
      key={opt}
      onClick={() => {
        set(value === opt ? "" : opt)
        setPage(1)
        setLoadMore(false)
      }}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
        value === opt
          ? "bg-navy text-white border-navy"
          : "bg-white text-gray-600 border-gray-200 hover:border-navy hover:text-navy"
      }`}
    >
      {opt}
    </button>
  ))
}

export default function JobboardClient({
  isLoggedIn,
  userSchool,
  initialJobs,
  initialTotal,
  defaultSchool,
  hideHero = false,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [contract, setContract] = useState(searchParams.get("contract") ?? "")
  const [school, setSchool] = useState(() => {
    const paramSchool = searchParams.get("school")
    if (paramSchool) return paramSchool
    if (defaultSchool) return defaultSchool
    return userSchool ?? ""
  })
  const [page, setPage] = useState(parseInt(searchParams.get("page") ?? "1", 10))
  const [loadMore, setLoadMore] = useState(false)

  const [jobs, setJobs] = useState<Job[]>(initialJobs.map(toJob))
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "createdAt")

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // Track if we've done first load (skip initial fetch when using SSR data)
  const isFirstLoad = useRef(true)

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set("q", debouncedSearch)
    if (contract) params.set("contract", contract)
    if (school) params.set("school", school)
    if (page > 1) params.set("page", String(page))
    if (sortBy !== "createdAt") params.set("sort", sortBy)
    router.replace(`/jobboard?${params.toString()}`, { scroll: false })
  }, [debouncedSearch, contract, school, page, sortBy, router])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" })
      if (debouncedSearch) params.set("q", debouncedSearch)
      if (contract) params.set("contract", contract)
      if (school) params.set("school", school)
      if (sortBy !== "createdAt") params.set("sort", sortBy)

      const res = await fetch(`/api/jobs?${params}`)
      const data = (await res.json()) as {
        jobs?: SerializedJob[]
        total?: number
      }
      const newJobs = (data.jobs ?? []).map(toJob)
      if (loadMore) {
        setJobs((prev) => [...prev, ...newJobs])
      } else {
        setJobs(newJobs)
      }
      setTotal(data.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, contract, school, sortBy, loadMore])

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }
    void fetchJobs()
  }, [fetchJobs])

  function handleLoadMore() {
    setLoadMore(true)
    setPage((p) => p + 1)
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Navbar */}
      <header className="bg-navy text-white py-3 px-6 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/ace-logo.png"
            alt="ACE"
            width={120}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Mon espace →
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Se connecter →
          </Link>
        )}
      </header>

      {/* Hero — hidden when school page provides its own hero */}
      {!hideHero && (
        <div className="bg-navy py-16 px-6">
          <h1 className="text-center text-3xl font-bold text-white mb-3">
            Trouvez votre alternance ou stage
          </h1>
          <p className="text-center text-white/70 text-base mb-8">
            Des offres sélectionnées pour les étudiants ACE Education
          </p>
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-2 flex gap-2 shadow-xl">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg focus:outline-none"
                placeholder="Rechercher une offre, une entreprise…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                  setLoadMore(false)
                }}
              />
            </div>
            <select
              className="px-3 py-2 text-sm border-l border-gray-100 rounded-lg focus:outline-none text-gray-600"
              value={contract}
              onChange={(e) => {
                setContract(e.target.value)
                setPage(1)
                setLoadMore(false)
              }}
            >
              <option value="">Tous les contrats</option>
              <option value="Alternance">Alternance</option>
              <option value="Stage">Stage</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
            </select>
            <button
              onClick={() => {
                setLoadMore(false)
                setPage(1)
                void fetchJobs()
              }}
              className="px-5 py-2.5 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors flex-shrink-0"
            >
              Rechercher
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Login banner */}
        {!isLoggedIn && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-teal/10 border border-teal/20 rounded-lg text-sm text-teal">
            <span>💡</span>
            <span>
              <Link href="/login" className="font-semibold hover:underline">
                Connectez-vous
              </Link>{" "}
              pour voir les offres adaptées à votre formation
            </span>
          </div>
        )}

        {/* Filter pills */}
        <div className="bg-white border-b py-3 px-4 mb-6 rounded-lg flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 self-center mr-1">École :</span>
          {pill(FILIERES, school, setSchool, setPage, setLoadMore)}
          <span className="text-xs text-gray-400 self-center ml-3 mr-1">Contrat :</span>
          {pill(CONTRACTS, contract, setContract, setPage, setLoadMore)}
        </div>

        {/* Results count + sort */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">{total} offres trouvées</p>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
              setLoadMore(false)
            }}
            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none text-gray-600"
          >
            <option value="createdAt">Plus récentes</option>
            <option value="company">Entreprise A→Z</option>
            <option value="title">Titre A→Z</option>
          </select>
        </div>

        {/* Job cards */}
        {loading && !loadMore ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState message="Aucune offre trouvée pour ces critères" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                savedJobIds={[]}
                isAuthenticated={isLoggedIn}
                publicMode={true}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {jobs.length < total && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loading && loadMore}
              className="px-6 py-2.5 border border-teal text-teal rounded-lg text-sm font-medium hover:bg-teal hover:text-white transition-colors flex items-center gap-2 mx-auto disabled:opacity-60"
            >
              {loading && loadMore && <Loader2 size={14} className="animate-spin" />}
              Charger plus
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
