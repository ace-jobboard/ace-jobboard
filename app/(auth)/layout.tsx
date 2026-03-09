import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — matches main site */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
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
            <div className="h-7 border-l border-gray-600" />
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Job Board</p>
              <p className="text-xs text-gray-400">Stages · Alternances · Apprentissage</p>
            </div>
          </div>
        </div>
      </header>

      {/* Centered card area */}
      <div className="flex items-start justify-center pt-12 pb-16 px-4">
        <div className="w-full max-w-md animate-fade-up">
          {children}
        </div>
      </div>
    </div>
  )
}
