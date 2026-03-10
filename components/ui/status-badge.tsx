interface Props {
  label: string
  variant?: "teal" | "navy" | "grey" | "green" | "orange" | "red" | "blue"
}

const styles: Record<NonNullable<Props["variant"]>, string> = {
  teal:   "bg-teal/10 text-teal border-teal/20",
  navy:   "bg-navy/10 text-navy border-navy/20",
  grey:   "bg-gray-100 text-gray-600 border-gray-200",
  green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  orange: "bg-amber-50 text-amber-700 border-amber-200",
  red:    "bg-red-50 text-red-600 border-red-200",
  blue:   "bg-blue-50 text-blue-700 border-blue-200",
}

export default function StatusBadge({ label, variant = "grey" }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {label}
    </span>
  )
}
