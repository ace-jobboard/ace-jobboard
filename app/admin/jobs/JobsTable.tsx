"use client"

import { useState, useMemo } from "react"
import { Trash2 } from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  filiere: string
  region: string
  contractType: string
  isActive: boolean
  createdAt: string
}

const filiereBadge: Record<string, string> = {
  "Sport Management":         "bg-green-50 text-green-700",
  "Hôtellerie & Luxe":        "bg-blue-50 text-blue-900",
  "Mode & Luxe":              "bg-purple-50 text-purple-700",
  "Design":                   "bg-orange-50 text-orange-700",
  "Illustration & Animation": "bg-red-50 text-red-700",
}

const PAGE_SIZE = 50

export default function JobsTable({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [search, setSearch] = useState("")
  const [filiereFilter, setFiliereFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all")
  const [page, setPage] = useState(1)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false
      if (filiereFilter && j.filiere !== filiereFilter) return false
      if (statusFilter === "active" && !j.isActive) return false
      if (statusFilter === "hidden" && j.isActive) return false
      return true
    })
  }, [jobs, search, filiereFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const filieres = Array.from(new Set(jobs.map((j) => j.filiere))).sort()

  async function deleteJob(id: string) {
    if (!confirm("Supprimer définitivement cette offre ?")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" })
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id))
      } else {
        alert("Erreur lors de la suppression")
      }
    } finally {
      setDeleting(null)
    }
  }

  async function toggleJob(id: string, currentActive: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      })
      if (res.ok) {
        setJobs((prev) => prev.map((j) => j.id === id ? { ...j, isActive: !currentActive } : j))
      }
    } finally {
      setToggling(null)
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Rechercher titre ou entreprise..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <select
          value={filiereFilter}
          onChange={(e) => { setFiliereFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">Toutes les filières</option>
          {filieres.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as "all" | "active" | "hidden"); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="all">Tous ({jobs.length})</option>
          <option value="active">Actifs ({jobs.filter(j => j.isActive).length})</option>
          <option value="hidden">Archivés ({jobs.filter(j => !j.isActive).length})</option>
        </select>
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} résultats</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Titre</th>
              <th className="text-left px-4 py-3 font-medium">Entreprise</th>
              <th className="text-left px-4 py-3 font-medium">Filière</th>
              <th className="text-left px-4 py-3 font-medium">Région</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((job) => (
              <tr key={job.id} className={`hover:bg-gray-50 transition-colors ${!job.isActive ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-medium text-gray-900 truncate">{job.title}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-[160px]">{job.company}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${filiereBadge[job.filiere] ?? "bg-gray-100 text-gray-600"}`}>
                    {job.filiere}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{job.region}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${job.isActive ? "text-green-600" : "text-gray-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${job.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                    {job.isActive ? "Actif" : "Archivé"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleJob(job.id, job.isActive)}
                      disabled={toggling === job.id}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        job.isActive
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {toggling === job.id ? "..." : job.isActive ? "Archiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      disabled={deleting === job.id}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Aucun résultat</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            ← Préc.
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-500">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Suiv. →
          </button>
        </div>
      )}
    </div>
  )
}
