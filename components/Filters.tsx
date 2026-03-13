'use client'

import { JobFilters } from '@/types/job'
import { Search } from 'lucide-react'

interface FiltersProps {
  onFilterChange: (filters: JobFilters) => void
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const filieres = [
    'Sport Management',
    'Hôtellerie & Luxe',
    'Mode & Luxe',
    'Design',
    'Illustration & Animation',
  ]

  const niveaux = ['Bac+3', 'Bac+4', 'Bac+5']

  const contractTypes = [
    'Alternance',
    'Stage',
    'Apprentissage',
    'Contrat de professionnalisation',
  ]

  const regions = [
    'Île-de-France',
    'Auvergne-Rhône-Alpes',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Hauts-de-France',
    'Pays de la Loire',
    "Provence-Alpes-Côte d'Azur",
    'Grand Est',
    'Bretagne',
  ]

  const selectClass = "border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all duration-150 w-full cursor-pointer appearance-none"

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {/* Search with icon */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher un poste, une entreprise..."
          className="border border-gray-200 bg-white rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all duration-150 w-full"
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>

      <select
        className={selectClass}
        onChange={(e) => onFilterChange({ filiere: e.target.value })}
      >
        <option value="">Toutes les filières</option>
        {filieres.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <select
        className={selectClass}
        onChange={(e) => onFilterChange({ niveau: e.target.value })}
      >
        <option value="">Tous les niveaux</option>
        {niveaux.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      <select
        className={selectClass}
        onChange={(e) => onFilterChange({ contractType: e.target.value })}
      >
        <option value="">Tous les contrats</option>
        {contractTypes.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className={selectClass}
        onChange={(e) => onFilterChange({ region: e.target.value })}
      >
        <option value="">Toutes les régions</option>
        {regions.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  )
}
