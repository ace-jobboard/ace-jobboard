"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import AvatarCircle from "@/components/ui/avatar-circle"
import StatusBadge from "@/components/ui/status-badge"
import EmptyState from "@/components/ui/empty-state"
import { MapPin, Search } from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  contractType: string
  filiere: string
  source: string
  location: string
  region: string
  createdAt: string
  url: string
}

const FILIERES = ["AMOS", "CMH", "EIDM", "ESDAC", "ENAAI"]
const FILIERE_MAP: Record<string, string> = {
  AMOS: "Sport Management",
  CMH: "Hôtellerie & Luxe",
  EIDM: "Mode & Luxe",
  ESDAC: "Design",
  ENAAI: "Illustration & Animation",
}

function daysAgo(d: string): string {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  return `${diff} days ago`
}

export default function JobBoardPage() {
  const [jobs, setJobs]           = useState<Job[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [contract, setContract]   = useState("")
  const [school, setSchool]       = useState("")
  const [source, setSource]       = useState("")
  const [page, setPage]           = useState(1)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search   && { search }),
        ...(contract && { contractType: contract }),
        ...(school   && { school }),
        ...(source   && { source }),
      })
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs ?? [])
      setTotal(data.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search, contract, school, source])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const pills = (options: string[], value: string, set: (v: string) => void) =>
    options.map((opt) => (
      <button
        key={opt}
        onClick={() => { set(value === opt ? "" : opt); setPage(1) }}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
          value === opt
            ? "bg-teal text-white border-teal"
            : "bg-white text-gray-600 border-gray-200 hover:border-teal hover:text-teal"
        }`}
      >
        {opt}
      </button>
    ))

  // Suppress unused variable warning
  void FILIERE_MAP

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-navy text-white py-3 px-6 flex items-center justify-between">
        <Link href="/">
          <Image src="/ace-logo.png" alt="ACE" width={120} height={40} className="h-9 w-auto" priority />
        </Link>
        <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Login →</Link>
      </header>

      {/* Hero search */}
      <div className="bg-navy pb-10 pt-8 px-6">
        <h1 className="text-center text-2xl font-bold text-white mb-6">Find your next alternance or internship</h1>
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-2 flex gap-2 shadow-xl">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg focus:outline-none"
              placeholder="Search for an internship, apprenticeship…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="px-3 py-2 text-sm border-l border-gray-100 rounded-lg focus:outline-none text-gray-600"
            value={contract}
            onChange={(e) => { setContract(e.target.value); setPage(1) }}
          >
            <option value="">All contracts</option>
            <option value="Alternance">Apprenticeship</option>
            <option value="Stage">Internship</option>
          </select>
          <button className="px-5 py-2.5 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors flex-shrink-0">
            Search
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs text-gray-400 self-center mr-1">School:</span>
          {pills(FILIERES, school, setSchool)}
          <span className="text-xs text-gray-400 self-center ml-2 mr-1">Source:</span>
          {pills(["wttj", "linkedin"], source, setSource)}
        </div>

        <p className="text-xs text-gray-400 mb-4">{total} offers found</p>

        {/* Job cards */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState message="No offers found for these criteria" />
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <AvatarCircle name={job.company} size="md" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy text-base leading-snug">{job.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin size={11} />{job.location || job.region}</span>
                        <span>🏫 {job.filiere}</span>
                        <span>🔗 {job.source.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge
                      label={job.contractType === "Alternance" ? "Apprenticeship" : job.contractType === "Stage" ? "Internship" : job.contractType}
                      variant={job.contractType === "Alternance" ? "teal" : "grey"}
                    />
                    <span className="text-xs text-gray-400">{daysAgo(job.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal font-medium hover:underline"
                  >
                    View offer →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {jobs.length < total && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2.5 border border-teal text-teal rounded-lg text-sm font-medium hover:bg-teal hover:text-white transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
