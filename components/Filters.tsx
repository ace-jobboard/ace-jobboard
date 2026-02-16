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
    'Paris',
    'Lyon',
    'Marseille',
    'Bordeaux',
    'Toulouse',
    'Lille',
    'Nantes',
    'Nice',
    'Chambéry',
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-lg font-semibold mb-4">Filtres</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Rechercher un poste, une entreprise..."
          className="border rounded-lg px-4 py-2 md:col-span-1"
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />

        <select
          className="border rounded-lg px-4 py-2"
          onChange={(e) => onFilterChange({ filiere: e.target.value })}
        >
          <option value="">Toutes les filières</option>
          {filieres.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          className="border rounded-lg px-4 py-2"
          onChange={(e) => onFilterChange({ niveau: e.target.value })}
        >
          <option value="">Tous les niveaux</option>
          {niveaux.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <select
          className="border rounded-lg px-4 py-2"
          onChange={(e) => onFilterChange({ contractType: e.target.value })}
        >
          <option value="">Tous les contrats</option>
          {contractTypes.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="border rounded-lg px-4 py-2"
          onChange={(e) => onFilterChange({ region: e.target.value })}
        >
          <option value="">Toutes les régions</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
