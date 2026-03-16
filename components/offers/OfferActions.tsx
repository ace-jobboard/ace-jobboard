"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clipboard, Trash2, ExternalLink, CheckCircle, XCircle } from "lucide-react"
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
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isApproved: !approved }),
    })
    if (res.ok) {
      setApproved((v) => !v)
      toast.success(approved ? "Offer un-approved" : "Offer approved")
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

      <button
        onClick={handleToggleApproval}
        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
          approved
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
        }`}
      >
        {approved ? <CheckCircle size={15} /> : <XCircle size={15} />}
        {approved ? "Approved — click to un-approve" : "Pending — click to approve"}
      </button>

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
