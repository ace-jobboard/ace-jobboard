"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { profileSchema } from "@/lib/validations/user"
import CvUploadSection from "@/components/dashboard/CvUploadSection"

type ProfileFormValues = {
  name?: string
  school?: "AMOS" | "CMH" | "EIDM" | "ESDAC" | "ENAAI" | null
  educationLevel?: "Bac+3" | "Bac+4" | "Bac+5" | null
  graduationYear?: number | null
  specialization?: string
  phone?: string
}

type ContractPref = "Alternance" | "Stage" | "Both" | "Any"
type FrequencyPref = "Daily" | "Weekly"

interface UserPreferences {
  contract?: ContractPref
  regions?: string[]
  alerts?: boolean
  frequency?: FrequencyPref
  [key: string]: unknown
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

const REGIONS = [
  "Île-de-France",
  "PACA",
  "Auvergne-Rhône-Alpes",
  "Occitanie",
  "Other",
]

const CONTRACT_OPTIONS: { value: ContractPref; label: string }[] = [
  { value: "Alternance", label: "Alternance" },
  { value: "Stage",      label: "Stage" },
  { value: "Both",       label: "Both" },
  { value: "Any",        label: "Any" },
]

interface ProfileFormProps {
  user: {
    name?: string | null
    email?: string | null
    school?: string | null
    educationLevel?: string | null
    graduationYear?: number | null
    specialization?: string | null
    phone?: string | null
    preferences?: unknown
    cvUrl?: string | null
    cvFileName?: string | null
  }
  completionPercent: number
}

const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

function parsePreferences(raw: unknown): UserPreferences {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as UserPreferences
  }
  return {}
}

export default function ProfileForm({ user, completionPercent }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)

  const existingPrefs = parsePreferences(user.preferences)

  const [prefContract,  setPrefContract]  = useState<ContractPref>(existingPrefs.contract ?? "Any")
  const [prefRegions,   setPrefRegions]   = useState<string[]>(existingPrefs.regions ?? [])
  const [prefAlerts,    setPrefAlerts]    = useState<boolean>(existingPrefs.alerts ?? false)
  const [prefFrequency, setPrefFrequency] = useState<FrequencyPref>(existingPrefs.frequency ?? "Weekly")

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const error = await response.json() as { error?: string }
        throw new Error(error.error || "Erreur lors de la mise à jour")
      }
      toast.success("Profil mis à jour !")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  async function onSavePreferences() {
    setIsSavingPrefs(true)
    try {
      const newPrefs: UserPreferences = {
        ...existingPrefs,
        contract:  prefContract,
        regions:   prefRegions,
        alerts:    prefAlerts,
        frequency: prefFrequency,
      }
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: newPrefs }),
      })
      if (!response.ok) {
        const error = await response.json() as { error?: string }
        throw new Error(error.error || "Erreur lors de la mise à jour")
      }
      toast.success("Preferences saved ✓")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsSavingPrefs(false)
    }
  }

  function toggleRegion(region: string) {
    setPrefRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
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

      {/* CV upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">CV</h3>
        <p className="text-sm text-gray-400 mb-5">Uploadez votre CV au format PDF (max 5MB)</p>
        <CvUploadSection initialCvUrl={user.cvUrl ?? null} initialCvFileName={user.cvFileName ?? null} />
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

      {/* Job preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Job preferences</h3>
        <p className="text-sm text-gray-400 mb-5">Personnalisez vos préférences de recherche</p>

        <div className="space-y-5">
          {/* Preferred contract */}
          <div>
            <p className={labelClass}>Preferred contract</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {CONTRACT_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="prefContract"
                    value={opt.value}
                    checked={prefContract === opt.value}
                    onChange={() => setPrefContract(opt.value)}
                    className="accent-teal"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Preferred regions */}
          <div>
            <p className={labelClass}>Preferred regions</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {REGIONS.map((region) => (
                <label key={region} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefRegions.includes(region)}
                    onChange={() => toggleRegion(region)}
                    className="accent-teal"
                  />
                  {region}
                </label>
              ))}
            </div>
          </div>

          {/* Email alerts toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prefAlerts}
                onChange={(e) => setPrefAlerts(e.target.checked)}
                className="accent-teal w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Email alerts</span>
            </label>
          </div>

          {/* Alert frequency — only when alerts enabled */}
          {prefAlerts && (
            <div>
              <label htmlFor="alertFrequency" className={labelClass}>Alert frequency</label>
              <select
                id="alertFrequency"
                value={prefFrequency}
                onChange={(e) => setPrefFrequency(e.target.value as FrequencyPref)}
                className={inputClass}
                style={{ maxWidth: 200 }}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          )}

          <button
            onClick={onSavePreferences}
            disabled={isSavingPrefs}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50"
          >
            {isSavingPrefs && <Loader2 className="w-4 h-4 animate-spin" />}
            Sauvegarder les préférences
          </button>
        </div>
      </div>
    </div>
  )
}
