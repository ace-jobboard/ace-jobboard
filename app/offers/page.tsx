"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AppShell from "@/components/layout/AppShell"
import AvatarCircle from "@/components/ui/avatar-circle"
import StatusBadge from "@/components/ui/status-badge"
import EmptyState from "@/components/ui/empty-state"
import {
  Search, SlidersHorizontal, RefreshCw, Eye, Trash2,
  ChevronUp, ChevronDown, X,
} from "lucide-react"
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
  isApproved: boolean
}

type SortKey = "company" | "title" | "contractType" | "filiere" | "source" | "location" | "createdAt" | "isApproved"
type SortDir = "asc" | "desc"
type TabKey = "all" | "Alternance" | "Stage" | "other" | "pending"

const SCHOOLS  = ["AMOS", "CMH", "EIDM", "ESDAC", "ENAAI"]
const SOURCES  = ["wttj", "linkedin", "indeed"]
const CONTRACTS = ["Alternance", "Stage"]
const PAGE_SIZES = [25, 50, 100]

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
  const router       = useRouter()
  const searchParams = useSearchParams()

  // Read initial state from URL
  const [search,        setSearch]        = useState(searchParams.get("q") ?? "")
  const [school,        setSchool]        = useState(searchParams.get("school") ?? "")
  const [source,        setSource]        = useState(searchParams.get("source") ?? "")
  const [contract,      setContract]      = useState(searchParams.get("contract") ?? "")
  const [approved,      setApproved]      = useState(searchParams.get("approved") ?? "")
  const [tab,           setTab]           = useState<TabKey>((searchParams.get("tab") as TabKey) ?? "all")
  const [page,          setPage]          = useState(parseInt(searchParams.get("page") ?? "1", 10))
  const [sortKey,       setSortKey]       = useState<SortKey>((searchParams.get("sort") as SortKey) ?? "createdAt")
  const [sortDir,       setSortDir]       = useState<SortDir>((searchParams.get("dir") as SortDir) ?? "desc")
  const [limit,         setLimit]         = useState(parseInt(searchParams.get("limit") ?? "25", 10))
  const [showFilters,   setShowFilters]   = useState(false)

  const [jobs,         setJobs]         = useState<Job[]>([])
  const [total,        setTotal]        = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [syncing,      setSyncing]      = useState(false)
  const [lastSync,     setLastSync]     = useState<string | null>(null)
  // Optimistic approval: track per-id overrides
  const [approvalOverrides, setApprovalOverrides] = useState<Record<string, boolean>>({})
  // Bulk selection
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set())
  const [bulkLoading,  setBulkLoading]  = useState(false)

  // Debounce search
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => setDebouncedSearch(search), 400)
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current) }
  }, [search])

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set("q", debouncedSearch)
    if (school)   params.set("school", school)
    if (source)   params.set("source", source)
    if (contract) params.set("contract", contract)
    if (approved) params.set("approved", approved)
    if (tab !== "all") params.set("tab", tab)
    if (page > 1) params.set("page", String(page))
    if (sortKey !== "createdAt") params.set("sort", sortKey)
    if (sortDir !== "desc") params.set("dir", sortDir)
    if (limit !== 25) params.set("limit", String(limit))
    router.replace(`/offers?${params.toString()}`, { scroll: false })
  }, [debouncedSearch, school, source, contract, approved, tab, page, sortKey, sortDir, limit, router])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: String(limit),
        sort:  sortKey,
        dir:   sortDir,
      })
      if (debouncedSearch) params.set("q", debouncedSearch)
      if (school)   params.set("school", school)
      if (source)   params.set("source", source)
      if (contract) params.set("contract", contract)
      if (approved) params.set("approved", approved)
      // Tab filter
      if (tab === "Alternance" || tab === "Stage") {
        params.set("contract", tab)
      } else if (tab === "other") {
        // fetch without contract filter, filter client-side
      } else if (tab === "pending") {
        params.set("approved", "false")
      }

      const res  = await fetch(`/api/jobs?${params}`)
      const data = await res.json() as { jobs?: Job[]; total?: number }
      let fetchedJobs = data.jobs ?? []
      if (tab === "other") {
        fetchedJobs = fetchedJobs.filter((j) => j.contractType !== "Alternance" && j.contractType !== "Stage")
      }
      setJobs(fetchedJobs)
      setTotal(data.total ?? 0)
      // Reset approval overrides and bulk selection when we reload
      setApprovalOverrides({})
      setSelectedIds(new Set())
    } finally {
      setLoading(false)
    }
  }, [page, limit, sortKey, sortDir, debouncedSearch, school, source, contract, approved, tab])

  useEffect(() => { void fetchJobs() }, [fetchJobs])

  // Fetch pending count and lastSync on mount
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json() as { pendingApproval?: number; lastSync?: string | null }
          setPendingCount(data.pendingApproval ?? 0)
          setLastSync(data.lastSync ?? null)
        }
      } catch {
        // ignore
      }
    })()
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      const res  = await fetch("/api/sync", { method: "POST" })
      const data = await res.json() as {
        totals?: { fetched: number; saved: number; duplicates: number; filtered: number }
        durationMs?: number
        errors?: string[]
        // Legacy fallback
        saved?: number; filtered?: number; synced?: number
      }
      if (data.totals) {
        const t = data.totals
        const secs = Math.round((data.durationMs ?? 0) / 1000)
        toast.success("✅ Sync complete", {
          description: `${t.saved} saved · ${t.duplicates} duplicates · ${t.filtered} filtered · ${secs}s`,
        })
      } else {
        toast.success(`Sync complete: ${data.saved ?? data.synced ?? 0} saved, ${data.filtered ?? 0} filtered`)
      }
      void fetchJobs()
      // Refresh lastSync
      try {
        const statsRes = await fetch("/api/dashboard/stats")
        if (statsRes.ok) {
          const stats = await statsRes.json() as { pendingApproval?: number; lastSync?: string | null }
          setPendingCount(stats.pendingApproval ?? 0)
          setLastSync(stats.lastSync ?? null)
        }
      } catch { /* ignore */ }
    } catch {
      toast.error("Sync failed")
    } finally {
      setSyncing(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this offer permanently?")) return
    const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Offer deleted")
      setJobs((prev) => prev.filter((j) => j.id !== id))
      setTotal((t) => t - 1)
    } else {
      toast.error("Delete failed")
    }
  }

  async function handleToggleApproved(job: Job) {
    const currentApproved = approvalOverrides[job.id] !== undefined
      ? approvalOverrides[job.id]
      : job.isApproved
    const newApproved = !currentApproved
    // Optimistic update
    setApprovalOverrides((prev) => ({ ...prev, [job.id]: newApproved }))
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: newApproved }),
      })
      if (res.ok) {
        toast.success(newApproved ? "Offer approved" : "Approval revoked")
        setPendingCount((c) => newApproved ? Math.max(0, c - 1) : c + 1)
      } else {
        // Revert
        setApprovalOverrides((prev) => ({ ...prev, [job.id]: currentApproved }))
        toast.error("Failed to update approval status")
      }
    } catch {
      // Revert
      setApprovalOverrides((prev) => ({ ...prev, [job.id]: currentApproved }))
      toast.error("Failed to update approval status")
    }
  }

  async function handleBulkAction(action: 'approve' | 'disapprove' | 'delete') {
    if (action === 'delete' && !confirm(`Supprimer ${selectedIds.size} offre(s) ?`)) return
    setBulkLoading(true)
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) =>
        action === 'delete'
          ? fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' })
          : fetch(`/api/admin/jobs/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isApproved: action === 'approve' }),
            })
      ))
      const label = action === 'delete' ? 'supprimées' : action === 'approve' ? 'approuvées' : 'désapprouvées'
      toast.success(`${ids.length} offre(s) ${label}`)
      setSelectedIds(new Set())
      void fetchJobs()
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setBulkLoading(false)
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
    setPage(1)
  }

  function resetFilters() {
    setSearch(""); setSchool(""); setSource(""); setContract(""); setApproved("")
    setTab("all"); setPage(1)
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={12} className="text-gray-300" />
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-navy" />
      : <ChevronDown size={12} className="text-navy" />
  }

  const activeFilterCount = [school, source, contract, approved].filter(Boolean).length
  const hasActiveFilters  = activeFilterCount > 0 || !!debouncedSearch

  const totalPages = Math.ceil(total / limit)

  const tabs: { key: TabKey; label: string; orange?: boolean }[] = [
    { key: "all",        label: `All (${total})` },
    { key: "Alternance", label: "Alternance" },
    { key: "Stage",      label: "Stage" },
    { key: "other",      label: "Other" },
    { key: "pending",    label: pendingCount > 0 ? `Pending (${pendingCount})` : "Pending", orange: pendingCount > 0 },
  ]

  const columns: [SortKey, string][] = [
    ["company",      "Company"],
    ["title",        "Title"],
    ["contractType", "Contract"],
    ["filiere",      "School"],
    ["source",       "Source"],
    ["location",     "Location"],
    ["createdAt",    "Published"],
    ["isApproved",   "Approved"],
  ]

  return (
    <AppShell title="Offers">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          OFFERS
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-navy/10 text-navy text-xs font-bold">
            {total.toLocaleString()}
          </span>
        </h2>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 disabled:opacity-60 transition-colors"
          >
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "+ Sync"}
          </button>
          {lastSync && (
            <p className="text-xs text-gray-400">Last synced: {lastSync}</p>
          )}
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/30"
              placeholder="Search offer, company…"
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
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal text-white text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={14} /> Reset
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* School */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">School</p>
              <div className="space-y-1">
                {SCHOOLS.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={school === s}
                      onChange={() => { setSchool(school === s ? "" : s); setPage(1) }}
                      className="accent-teal"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            {/* Source */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Source</p>
              <div className="space-y-1">
                {SOURCES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source === s}
                      onChange={() => { setSource(source === s ? "" : s); setPage(1) }}
                      className="accent-teal"
                    />
                    {s.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
            {/* Contract */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contract</p>
              <div className="space-y-1">
                {CONTRACTS.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contract === c}
                      onChange={() => { setContract(contract === c ? "" : c); setPage(1) }}
                      className="accent-teal"
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            {/* Approval */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Approval</p>
              <div className="space-y-1">
                {[["", "All"], ["true", "Approved"], ["false", "Pending"]].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="approved"
                      checked={approved === val}
                      onChange={() => { setApproved(val); setPage(1) }}
                      className="accent-teal"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
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
                : t.orange
                  ? "text-orange-500 border-transparent hover:text-orange-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-navy/5 border border-navy/10 rounded-xl mb-3">
          <span className="text-sm font-medium text-navy">{selectedIds.size} offre{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => handleBulkAction('approve')} disabled={bulkLoading} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50">✓ Approuver</button>
            <button onClick={() => handleBulkAction('disapprove')} disabled={bulkLoading} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50">✗ Désapprouver</button>
            <button onClick={() => handleBulkAction('delete')} disabled={bulkLoading} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50">🗑 Supprimer</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={jobs.length > 0 && jobs.every((j) => selectedIds.has(j.id))}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(jobs.map((j) => j.id)))
                      else setSelectedIds(new Set())
                    }}
                    className="w-4 h-4 rounded border-gray-300 accent-teal cursor-pointer"
                  />
                </th>
                {columns.map(([k, label]) => (
                  <th
                    key={k}
                    className="px-4 py-3 text-left cursor-pointer hover:text-navy transition-colors whitespace-nowrap"
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
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-4">
                    <EmptyState message="No offers found for these criteria" />
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(job.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds)
                          if (e.target.checked) next.add(job.id)
                          else next.delete(job.id)
                          setSelectedIds(next)
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-teal accent-teal cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AvatarCircle name={job.company} size="sm" />
                        <span className="font-medium text-gray-700 truncate max-w-[120px]">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/offers/${job.id}`}
                        className="text-navy font-medium hover:underline truncate max-w-[200px] block"
                      >
                        {job.title}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={job.contractType} variant={contractVariant(job.contractType)} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{job.filiere}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={job.source.toUpperCase()} variant={sourceVariant(job.source)} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[120px]">{job.location}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{daysAgo(job.createdAt)}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const isApproved = approvalOverrides[job.id] !== undefined
                          ? approvalOverrides[job.id]
                          : job.isApproved
                        return (
                          <button
                            onClick={() => handleToggleApproved(job)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            }`}
                            title="Toggle approval"
                          >
                            {isApproved ? "Approved" : "Pending"}
                          </button>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <a
                          href={`/offers/${job.id}`}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-navy"
                          title="View"
                        >
                          <Eye size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-400">
                Page {page} of {totalPages} — {total} total
              </p>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1) }}
                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40">«</button>
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40">‹</button>
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
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40">›</button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-40">»</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
