"use client"

import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts"

const SCHOOL_COLORS: Record<string, string> = {
  "Sport Management":         "#15803d", // green-700  (AMOS)
  "Hôtellerie & Luxe":       "#1e40af", // blue-800   (CMH)
  "Mode & Luxe":              "#7e22ce", // purple-800 (EIDM)
  "Design":                   "#c2410c", // orange-700 (ESDAC)
  "Illustration & Animation": "#b91c1c", // red-700    (ENAAI)
  "_dump":                    "#d1d5db",
}

interface Props {
  byFiliere: { filiere: string; count: number }[]
  byContract: { contractType: string; count: number }[]
}

export default function DashboardCharts({ byFiliere, byContract }: Props) {
  const filiereData = byFiliere.filter((d) => d.filiere !== "_dump")
  const contractData = byContract

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-navy uppercase tracking-wide mb-4">Breakdown by school</h2>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={filiereData}
              dataKey="count"
              nameKey="filiere"
              cx="40%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
            >
              {filiereData.map((entry) => (
                <Cell key={entry.filiere} fill={SCHOOL_COLORS[entry.filiere] ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v} offers`, ""]} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value: string) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-navy uppercase tracking-wide mb-4">Breakdown by contract</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={contractData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="contractType" type="category" tick={{ fontSize: 11 }} width={90} />
            <Tooltip formatter={(v) => [`${v} offers`, "Count"]} />
            <Bar dataKey="count" fill="#2aa38f" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
