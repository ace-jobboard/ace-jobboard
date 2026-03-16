"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clipboard, Trash2, ExternalLink, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface Props {
  id: string
  url: string
  isApproved: boolean
}

export default function OfferActions({ id, url, isApproved: initialApproved }: Props) {
  const [deleting,  setDeleting]  = useState(false)
  const [approved,  setApproved]  = useState(initialApproved)
  const [copied,    setCopied]    = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Delete this offer permanently?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Offer deleted")
        router.push("/offers")
      } else {
        toast.error("Delete failed")
      }
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleApproval() {
    const newApproved = !approved
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isApproved: newApproved }),
    })
    if (res.ok) {
      setApproved(newApproved)
      toast.success(newApproved ? "Offer approved" : "Approval revoked")
      router.refresh()
    } else {
      toast.error("Update failed")
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Link copied!")
  }

  return (
    <div className="space-y-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors"
      >
        <ExternalLink size={15} />
        View listing
      </a>

      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Clipboard size={15} />
        {copied ? "Copied!" : "Copy link"}
      </button>

      {/* Approval section */}
      {approved ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
            <CheckCircle size={15} />
            <span>✓ Approved</span>
          </div>
          <button
            onClick={handleToggleApproval}
            className="w-full text-xs text-red-500 hover:text-red-700 hover:underline text-center py-1 transition-colors"
          >
            Revoke approval
          </button>
        </div>
      ) : (
        <button
          onClick={handleToggleApproval}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
        >
          Approve this offer
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        <Trash2 size={15} />
        {deleting ? "Deleting…" : "Delete this offer"}
      </button>
    </div>
  )
}
