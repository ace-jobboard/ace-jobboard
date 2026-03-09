"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { profileSchema } from "@/lib/validations/user"

type ProfileFormValues = {
  name?: string
  school?: "AMOS" | "CMH" | "EIDM" | "ESDAC" | "ENAAI" | null
  educationLevel?: "Bac+3" | "Bac+4" | "Bac+5" | null
  graduationYear?: number | null
  specialization?: string
  phone?: string
}

const SCHOOLS = ["AMOS", "CMH", "EIDM", "ESDAC", "ENAAI"] as const
const EDUCATION_LEVELS = ["Bac+3", "Bac+4", "Bac+5"] as const
const SCHOOL_LABELS: Record<string, string> = {
  AMOS:  "AMOS — Sport Management",
  CMH:   "CMH — Hôtellerie & Luxe",
  EIDM:  "EIDM — Mode & Luxe",
  ESDAC: "ESDAC — Design",
  ENAAI: "ENAAI — Illustration & Animation",
}

interface ProfileFormProps {
  user: {
    name?: string | null
    email?: string | null
    school?: string | null
    educationLevel?: string | null
    graduationYear?: number | null
    specialization?: string | null
    phone?: string | null
  }
  completionPercent: number
}

const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

export default function ProfileForm({ user, completionPercent }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      name:           user.name ?? "",
      school:         (user.school as ProfileFormValues["school"]) ?? undefined,
      educationLevel: (user.educationLevel as ProfileFormValues["educationLevel"]) ?? undefined,
      graduationYear: user.graduationYear ?? undefined,
      specialization: user.specialization ?? "",
      phone:          user.phone ?? "",
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la mise à jour")
      }
      toast.success("Profil mis à jour !")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const completionColor =
    completionPercent >= 80 ? "bg-green-500" :
    completionPercent >= 50 ? "bg-amber-500" : "bg-red-400"

  return (
    <div className="space-y-5">
      {/* Completion bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Complétion du profil</span>
          <span className="text-sm font-bold text-gray-900">{completionPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${completionColor}`} style={{ width: `${completionPercent}%` }} />
        </div>
        {completionPercent === 100 ? (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Profil complet !
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-2">Complétez votre profil pour améliorer vos chances</p>
        )}
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Informations personnelles</h3>
        <p className="text-sm text-gray-400 mb-5">Mettez à jour vos informations de profil</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>Nom complet</label>
              <input id="name" type="text" placeholder="Prénom Nom" {...register("name")} className={inputClass} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input value={user.email ?? ""} disabled className={inputClass} />
              <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas être modifié</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="school" className={labelClass}>École</label>
              <select id="school" {...register("school")} className={inputClass}>
                <option value="">Sélectionnez votre école</option>
                {SCHOOLS.map((s) => <option key={s} value={s}>{SCHOOL_LABELS[s]}</option>)}
              </select>
              {errors.school && <p className="text-xs text-red-600 mt-1">{errors.school.message}</p>}
            </div>
            <div>
              <label htmlFor="educationLevel" className={labelClass}>Niveau d&apos;études</label>
              <select id="educationLevel" {...register("educationLevel")} className={inputClass}>
                <option value="">Sélectionnez votre niveau</option>
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="graduationYear" className={labelClass}>Année de diplomation</label>
              <input id="graduationYear" type="number" placeholder="2025" min="2020" max="2035" {...register("graduationYear", { valueAsNumber: true })} className={inputClass} />
              {errors.graduationYear && <p className="text-xs text-red-600 mt-1">{errors.graduationYear.message}</p>}
            </div>
            <div>
              <label htmlFor="specialization" className={labelClass}>Spécialisation</label>
              <input id="specialization" type="text" placeholder="ex: Marketing digital, Finance..." {...register("specialization")} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>Téléphone</label>
            <input id="phone" type="tel" placeholder="06 12 34 56 78" {...register("phone")} className={inputClass} />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sauvegarder les modifications
          </button>
        </form>
      </div>
    </div>
  )
}
