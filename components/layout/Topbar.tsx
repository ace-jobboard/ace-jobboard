"use client"

import { Bell, ChevronDown, Search, X } from "lucide-react"
import AvatarCircle from "@/components/ui/avatar-circle"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  title: string
  company: string
  filiere: string
  contractType: string
}

interface Props {
  title: string
  userName?: string
}

export default function Topbar({ title, userName = "Admin" }: Props) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json() as { results?: SearchResult[] }
        setResults(data.results ?? [])
      }
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => void fetchResults(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchResults])

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false)
        setQuery("")
        setResults([])
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setQuery("")
        setResults([])
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function handleResultClick(id: string) {
    router.push(`/offers/${id}`)
    setSearchOpen(false)
    setQuery("")
    setResults([])
  }

  return (
    <header className="fixed top-0 left-[70px] right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 z-40">
      <h1 className="text-base font-semibold text-navy flex-1">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Global search */}
        <div ref={containerRef} className="relative">
          <div className="flex items-center gap-2">
            {searchOpen && (
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-64 pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/30"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); setResults([]) }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Rechercher"
            >
              <Search size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Dropdown results */}
          {searchOpen && query.length >= 2 && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {searching ? (
                <div className="px-4 py-3 text-xs text-gray-400">Recherche…</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-400">Aucun résultat</div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleResultClick(r.id)}
                    className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 truncate">{r.company}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal/10 text-teal border border-teal/20">
                      {r.filiere}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
          <Bell size={18} className="text-gray-500" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
          <AvatarCircle name={userName} size="sm" />
          <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  )
}
