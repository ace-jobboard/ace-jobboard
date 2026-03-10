import { type LucideIcon } from "lucide-react"

interface Props {
  icon: LucideIcon
  label: string
  value: string | number
  iconColor?: string
}

export default function KpiCard({ icon: Icon, label, value, iconColor = "text-teal" }: Props) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg bg-gray-50 ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-navy mt-0.5">{value}</p>
      </div>
    </div>
  )
}
