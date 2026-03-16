import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-6xl font-bold text-navy">404</h1>
      <p className="text-gray-500">Page introuvable.</p>
      <Link href="/" className="text-teal underline">Retour à l&apos;accueil</Link>
    </div>
  )
}
