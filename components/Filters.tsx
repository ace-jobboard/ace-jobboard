'use client'

import { JobFilters } from '@/types/job'

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
    'Provence-Alpes-Côte d'Azur',
    'Grand Est',
    'Bretagne',
  ]

  const inputClass = "border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300 transition-colors w-full"

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <input
        type="text"
        placeholder="Rechercher un poste, une entreprise..."
        className={inputClass}
        onChange={(e) => onFilterChange({ search: e.target.value })}
      />

      <select
        className={inputClass}
        onChange={(e) => onFilterChange({ filiere: e.target.value })}
      >
        <option value="">Toutes les filières</option>
        {filieres.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <select
        className={inputClass}
        onChange={(e) => onFilterChange({ niveau: e.target.value })}
      >
        <option value="">Tous les niveaux</option>
        {niveaux.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      <select
        className={inputClass}
        onChange={(e) => onFilterChange({ contractType: e.target.value })}
      >
        <option value="">Tous les contrats</option>
        {contractTypes.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className={inputClass}
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

