import Image from 'next/image'
import Link from 'next/link'
import AvatarCircle from '@/components/ui/avatar-circle'

interface PublicNavbarProps {
  isLoggedIn: boolean
  userName?: string | null
  userSchool?: string | null
  currentPath?: string
}

const NAV_LINKS = [
  { label: 'Toutes les offres', href: '/jobboard' },
  { label: 'AMOS',  href: '/jobboard/school/AMOS' },
  { label: 'CMH',   href: '/jobboard/school/CMH' },
  { label: 'EIDM',  href: '/jobboard/school/EIDM' },
  { label: 'ESDAC', href: '/jobboard/school/ESDAC' },
  { label: 'ENAAI', href: '/jobboard/school/ENAAI' },
]

export default function PublicNavbar({
  isLoggedIn,
  userName,
  userSchool,
  currentPath,
}: PublicNavbarProps) {
  return (
    <header className="bg-navy text-white h-14 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left: logo + separator + "Job Board" */}
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <Image
          src="/ace-logo.png"
          alt="ACE Education"
          width={120}
          height={40}
          className="h-9 w-auto object-contain"
          priority
        />
        <div className="hidden md:block h-5 border-l border-white/20" />
        <span className="hidden md:block text-sm font-medium text-white/70">Job Board</span>
      </Link>

      {/* Middle: nav links (hidden on small screens) */}
      <nav className="hidden lg:flex items-center gap-5">
        {NAV_LINKS.map(link => {
          const isActive = currentPath === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs transition-colors ${
                isActive
                  ? 'text-white underline underline-offset-4'
                  : 'text-white/50 hover:text-white/90'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Right: auth actions */}
      <div className="flex items-center gap-3 shrink-0">
        {isLoggedIn ? (
          <>
            {userSchool && (
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                {userSchool}
              </span>
            )}
            <Link
              href="/dashboard"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Mon espace →
            </Link>
            {userName && <AvatarCircle name={userName} size="sm" />}
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="bg-teal hover:bg-teal-hover text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Créer un compte
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
