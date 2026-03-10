import { SearchX } from "lucide-react"

interface Props {
  message?: string
  icon?: React.ReactNode
}

export default function EmptyState({ message = "Aucun résultat trouvé", icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-teal mb-4">
        {icon ?? <SearchX size={48} strokeWidth={1.5} />}
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}
