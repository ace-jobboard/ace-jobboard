"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clipboard, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Props { id: string; url: string }

export default function OfferActions({ id, url }: Props) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Delete this offer permanently?")) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" })
      toast.success("Offer deleted")
      router.push("/offers")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied!") }}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Clipboard size={15} />
        Copy link
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        <Trash2 size={15} />
        {deleting ? "Deleting…" : "Delete this offer"}
      </button>
    </>
  )
}
