import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { auth } from "@/auth"
import UserNav from "@/components/auth/UserNav"
import DashboardTabs from "@/components/dashboard/DashboardTabs"

export const metadata = {
  title: "Mon espace | ACE Job Board",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar — matches main page */}
      <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/ace-logo.png"
                  alt="ACE Education"
                  width={160}
                  height={52}
                  className="h-11 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="hidden md:block h-7 border-l border-gray-600" />
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Offres
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-white font-medium px-3 py-1.5 rounded-lg bg-gray-700 transition-colors"
                >
                  Mon espace
                </Link>
              </nav>
            </div>
            <UserNav user={session.user} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mon espace</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Gérez votre profil et vos offres sauvegardées
          </p>
        </div>

        {/* Tabs */}
        <DashboardTabs />

        {/* Page content */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
