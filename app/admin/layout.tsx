import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

const navLinks = [
  { href: "/admin", label: "Vue d'ensemble", icon: "📊" },
  { href: "/admin/jobs", label: "Offres", icon: "💼" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { href: "/admin/feedback", label: "Retours", icon: "💬" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex bg-light">
      {/* Sidebar */}
      <aside className="w-56 bg-navy text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <Image
            src="/ace-logo.png"
            alt="ACE Education"
            width={120}
            height={40}
            className="h-9 w-auto object-contain"
          />
          <p className="text-xs text-white/40 mt-1">Administration</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            <span>🌐</span> Voir le site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
