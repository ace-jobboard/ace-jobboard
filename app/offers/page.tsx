"use client"

import { useState, useEffect, useCallback } from "react"
import AppShell from "@/components/layout/AppShell"
import AvatarCircle from "@/components/ui/avatar-circle"
import StatusBadge from "@/components/ui/status-badge"
import EmptyState from "@/components/ui/empty-state"
import { Search, SlidersHorizontal, RefreshCw, Eye, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface Job {
  id: string
  title: string
  company: string
  contractType: string
  filiere: string
  source: string
  location: string
  createdAt: string
}

type SortKey = keyof Job
type SortDir = "asc" | "desc"

function contractVariant(type: string): "teal" | "grey" | "green" {
  if (type === "Alternance") return "teal"
  if (type === "Stage") return "grey"
  return "green"
}

function sourceVariant(source: string): "orange" | "blue" | "grey" {
  if (source === "wttj") return "orange"
  if (source === "linkedin") return "blue"
  return "grey"
}

function daysAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  return `${diff}d ago`
}

export default function OffersPage() {
  const [jobs, setJobs]           = useState<Job[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [syncing, setSyncing]     = useState(false)
  const [search, setSearch]       = useState("")
  const [tab, setTab]             = useState<"all" | "Alternance" | "Stage">("all")
  const [page, setPage]           = useState(1)
  const [sortKey, setSortKey]     = useState<SortKey>("createdAt")
  const [sortDir, setSortDir]     = useState<SortDir>("desc")
  const [showFilters, setShowFilters] = useState(false)
  const limit = 20

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(tab !== "all" && { contractType: tab }),
      })
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs ?? [])
      setTotal(data.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search, tab])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch("/api/sync", { method: "POST" })
      const data = await res.json()
      toast.success(`✅ ${data.synced ?? 0} offers synced, ${data.skipped ?? 0} skipped`)
      fetchJobs()
    } catch {
      toast.error("Sync failed")
    } finally {
      setSyncing(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this offer?")) return
    await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" })
    toast.success("Offer deleted")
    fetchJobs()
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={12} className="text-gray-300" />
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-navy" />
      : <ChevronDown size={12} className="text-navy" />
  }

  const sorted = [...jobs].sort((a, b) => {
    const va = String(a[sortKey] ?? "")
    const vb = String(b[sortKey] ?? "")
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va)
  })

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all",        label: `All offers (${total})` },
    { key: "Alternance", label: "Apprenticeship" },
    { key: "Stage",      label: "Internship" },
  ]

  const totalPages = Math.ceil(total / limit)

  return (
    <AppShell title="Offers">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          OFFERS ({total.toLocaleString()})
        </h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 disabled:opacity-60 transition-colors"
        >
          <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing…" : "+ Sync offers"}
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/30"
              placeholder="Search for an offer, company…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1) }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "text-teal border-teal"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">
                {([
                  ["company",      "Company"],
                  ["title",        "Offer title"],
                  ["contractType", "Contract"],
                  ["filiere",      "School"],
                  ["source",       "Source"],
                  ["location",     "Location"],
                  ["createdAt",    "Published"],
                ] as [SortKey, string][]).map(([k, label]) => (
                  <th
                    key={k}
                    className="px-4 py-3 text-left cursor-pointer hover:text-navy transition-colors"
                    onClick={() => toggleSort(k)}
                  >
                    <span className="flex items-center gap-1">
                      {label} <SortIcon k={k} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4">
                    <EmptyState message="No offers found for these criteria" />
                  </td>
                </tr>
              ) : (
                sorted.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AvatarCircle name={job.company} size="sm" />
                        <span className="font-medium text-gray-700 truncate max-w-[140px]">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/offers/${job.id}`}
                        className="text-navy font-medium hover:underline truncate max-w-[220px] block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {job.title}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={job.contractType} variant={contractVariant(job.contractType)} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{job.filiere}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={job.source.toUpperCase()} variant={sourceVariant(job.source)} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[140px]">{job.location}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{daysAgo(job.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/offers/${job.id}`}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-navy"
                          title="View"
                        >
                          <Eye size={15} />
                        </a>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} — {total} total
            </p>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40"
              >«</button>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40"
              >‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, page - 2) + i
                if (p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2.5 py-1 text-xs rounded ${page === p ? "bg-navy text-white" : "hover:bg-gray-100"}`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40"
              >›</button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40"
              >»</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
