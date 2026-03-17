'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { FileText, Upload, Trash2, Loader2, ExternalLink } from 'lucide-react'

interface Props {
  initialCvUrl: string | null
  initialCvFileName: string | null
}

export default function CvUploadSection({ initialCvUrl, initialCvFileName }: Props) {
  const [cvUrl, setCvUrl] = useState(initialCvUrl)
  const [cvFileName, setCvFileName] = useState(initialCvFileName)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      toast.error('PDF uniquement')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5MB)')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/user/cv', { method: 'POST', body: formData })
      const data = await res.json() as { cvUrl?: string; cvFileName?: string; error?: string }
      if (!res.ok) { toast.error(data.error ?? 'Erreur upload'); return }
      setCvUrl(data.cvUrl ?? null)
      setCvFileName(data.cvFileName ?? null)
      toast.success('CV uploadé avec succès')
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer votre CV ?')) return
    setDeleting(true)
    try {
      await fetch('/api/user/cv', { method: 'DELETE' })
      setCvUrl(null)
      setCvFileName(null)
      toast.success('CV supprimé')
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">Mon CV</label>
      {cvUrl ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
          <FileText className="w-5 h-5 text-teal shrink-0" />
          <span className="text-sm text-gray-700 flex-1 truncate">{cvFileName ?? 'cv.pdf'}</span>
          <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-teal hover:text-teal-hover transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
          <button onClick={handleDelete} disabled={deleting}
            className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) void handleFile(f) }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dragOver ? 'border-teal bg-teal/5' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-gray-400" />
          )}
          <p className="text-sm text-gray-500 text-center">
            {uploading ? 'Upload en cours…' : 'Déposez votre PDF ici ou cliquez pour sélectionner'}
          </p>
          <p className="text-xs text-gray-400">Max 5MB · PDF uniquement</p>
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f) }} />
        </div>
      )}
    </div>
  )
}
