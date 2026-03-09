"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  jobId: string
  initialSaved: boolean
  isAuthenticated: boolean
}

export default function SaveButton({ jobId, initialSaved, isAuthenticated }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.info("Connectez-vous pour sauvegarder des offres", {
        action: {
          label: "Se connecter",
          onClick: () => router.push("/login"),
        },
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, { method: "POST" })
      if (!response.ok) throw new Error("Erreur")
      const data = await response.json()
      setSaved(data.saved)
      toast.success(data.saved ? "Offre sauvegardée !" : "Offre retirée des favoris")
    } catch {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={saved ? "Retirer des favoris" : "Sauvegarder l'offre"}
      className={cn(
        "p-2 rounded-full transition-all",
        saved
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-400 hover:text-red-400 hover:bg-red-50",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <Heart
        className={cn("w-4 h-4", saved && "fill-current")}
      />
    </button>
  )
}
