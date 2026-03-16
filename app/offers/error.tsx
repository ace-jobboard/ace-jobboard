'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
      <p className="text-lg font-medium text-gray-700">Une erreur est survenue.</p>
      <p className="text-sm text-gray-400">{error.digest ?? error.message}</p>
      <button onClick={reset} className="text-teal underline text-sm">Réessayer</button>
    </div>
  )
}
