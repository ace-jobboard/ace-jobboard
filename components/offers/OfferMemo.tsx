"use client"

import { useState } from "react"
import { toast } from "sonner"

interface Props {
  id: string
  initialMemo: string
}

export default function OfferMemo({ id, initialMemo }: Props) {
  const [memo,   setMemo]   = useState(initialMemo)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ memo }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        toast.success("Memo saved")
      } else {
        toast.error("Failed to save memo")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-300 rounded-lg p-5">
      <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Memo</h3>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={4}
        placeholder="Add a note about this offer…"
        className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-2 px-4 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-60 font-medium"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  )
}
