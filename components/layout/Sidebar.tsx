"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Briefcase, GraduationCap, ClipboardList,
  Building2, Settings, Users,
} from "lucide-react"

const NAV = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Briefcase,       label: "Offers",    href: "/offers" },
      { icon: GraduationCap,   label: "Students",  href: "/students" },
    ],
  },
  {
    label: "Content",
    items: [
      { icon: ClipboardList, label: "Job Board", href: "/" },
      { icon: Building2,     label: "Companies", href: "/companies" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: Settings, label: "Config",     href: "/admin/config" },
      { icon: Users,    label: "Promotions", href: "/admin/promotions" },
    ],
  },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[70px] bg-navy flex flex-col items-center py-4 z-50 shadow-lg">
      {/* Logo area */}
      <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center mb-6">
        <span className="text-teal font-bold text-sm">ACE</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 w-full px-2 flex-1">
        {NAV.map((section) =>
          section.items.map((item) => {
            const active = path === item.href || (item.href !== "/" && path.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group relative flex items-center justify-center w-full h-10 rounded-lg transition-colors ${
                  active
                    ? "bg-teal/20 border-l-2 border-teal"
                    : "hover:bg-white/10"
                }`}
              >
                <item.icon
                  size={20}
                  className={active ? "text-teal" : "text-gray-400 group-hover:text-white"}
                />
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </span>
              </Link>
            )
          })
        )}
      </nav>
    </aside>
  )
}
