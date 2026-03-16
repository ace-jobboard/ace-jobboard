'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function HomeSearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/jobboard?q=${encodeURIComponent(query.trim())}`)
    else router.push('/jobboard')
  }

  return (
    <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto gap-0">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Rechercher par métier, entreprise…"
        className="flex-1 px-5 py-3.5 rounded-l-xl bg-white text-gray-800 text-sm shadow-xl border-0 focus:outline-none focus:ring-2 focus:ring-teal"
      />
      <button type="submit"
        className="px-6 py-3.5 bg-teal hover:bg-teal-hover text-white font-semibold rounded-r-xl shadow-xl transition-colors flex items-center gap-2">
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Rechercher</span>
      </button>
    </form>
  )
}
