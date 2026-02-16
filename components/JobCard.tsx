import { Job } from '@/types/job'

interface JobCardProps {
  job: Job
}

const filiereBadgeColors: Record<string, string> = {
  'Sport Management': 'bg-blue-100 text-blue-800',
  'Hôtellerie & Luxe': 'bg-purple-100 text-purple-800',
  'Mode & Luxe': 'bg-pink-100 text-pink-800',
  'Design': 'bg-amber-100 text-amber-800',
  'Illustration & Animation': 'bg-emerald-100 text-emerald-800',
}

const contractBadgeColors: Record<string, string> = {
  'Alternance': 'bg-green-100 text-green-800',
  'Stage': 'bg-orange-100 text-orange-800',
  'Apprentissage': 'bg-cyan-100 text-cyan-800',
  'Contrat de professionnalisation': 'bg-teal-100 text-teal-800',
}

export default function JobCard({ job }: JobCardProps) {
  const filiereColors = filiereBadgeColors[job.filiere] || 'bg-gray-100 text-gray-800'
  const contractColors = contractBadgeColors[job.contractType] || 'bg-gray-100 text-gray-800'

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{job.title}</h3>
          <p className="text-gray-600 mt-1">{job.company}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${filiereColors}`}>
          {job.filiere}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${contractColors}`}>
          {job.contractType}
        </span>
        <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
          {job.niveau}
        </span>
      </div>

      <div className="flex gap-3 text-sm text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </span>
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
        {job.description}
      </p>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {new Date(job.createdAt).toLocaleDateString('fr-FR')}
        </span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Postuler
        </a>
      </div>
    </div>
  )
}
