"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Bookmark, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/dashboard/profile", label: "Mon profil", icon: User },
  { href: "/dashboard/saved-jobs", label: "Offres sauvegardées", icon: Bookmark },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
]

export default function DashboardTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all flex-1 justify-center",
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
