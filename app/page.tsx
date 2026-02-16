'use client'

import { useState, useEffect, useCallback } from 'react'
import Filters from '@/components/Filters'
import JobCard from '@/components/JobCard'
import { Job, JobFilters } from '@/types/job'

const filiereLabels = [
  'Sport Management',
  'Hôtellerie & Luxe',
  'Mode & Luxe',
  'Design',
  'Illustration & Animation',
]

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filters, setFilters] = useState<JobFilters>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.filiere) params.append('filiere', filters.filiere)
      if (filters.niveau) params.append('niveau', filters.niveau)
      if (filters.region) params.append('region', filters.region)
      if (filters.contractType) params.append('contractType', filters.contractType)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/jobs?${params.toString()}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des offres')

      const data = await response.json()
      setJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleFilterChange = (newFilters: JobFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const countByFiliere = (filiere: string) =>
    jobs.filter(j => j.filiere === filiere).length

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">ACE Job Board</h1>
          <p className="text-lg md:text-xl text-blue-100">
            Trouvez votre alternance ou stage idéal
          </p>
          <p className="text-sm text-blue-200 mt-2">
            Sport &bull; Hôtellerie &bull; Mode &bull; Design &bull; Illustration
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {!loading && !error && jobs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{jobs.length}</div>
                <div className="text-sm text-gray-600">Offres disponibles</div>
              </div>
              {filiereLabels.map(f => (
                <div key={f}>
                  <div className="text-2xl font-bold text-gray-700">{countByFiliere(f)}</div>
                  <div className="text-xs text-gray-500">{f}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Filters onFilterChange={handleFilterChange} />

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-lg">Chargement des offres...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Aucune offre trouvée
            </h3>
            <p className="mt-2 text-gray-600">
              Essayez de modifier vos filtres pour voir plus d&apos;opportunités
            </p>
          </div>
        )}

        {/* Job grid */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} ACE Education &mdash; AMOS &bull; CMH &bull; EIDM &bull; ESDAC &bull; ENAAI
          </p>
          <p className="text-xs mt-1 text-gray-500">
            Plateforme d&apos;offres de stages et alternances pour les étudiants ACE
          </p>
        </div>
      </footer>
    </main>
  )
}
