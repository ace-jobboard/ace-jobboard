"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2, MonitorSmartphone } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { changePasswordSchema, preferencesSchema, type ChangePasswordInput, type PreferencesInput } from "@/lib/validations/user"

const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
const labelClass = "block text-sm font-medium text-gray-700 mb-1"

interface SettingsFormProps {
  hasPassword: boolean
  hasMicrosoft: boolean
  preferences: {
    newJobMatches?: boolean
    applicationUpdates?: boolean
    weeklyNewsletter?: boolean
  }
}

export default function SettingsForm({ hasPassword, hasMicrosoft, preferences }: SettingsFormProps) {
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const prefsForm = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema) as any,
    defaultValues: {
      newJobMatches: preferences.newJobMatches ?? true,
      applicationUpdates: preferences.applicationUpdates ?? true,
      weeklyNewsletter: preferences.weeklyNewsletter ?? false,
    },
  })

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSavePreferences(data: PreferencesInput) {
    setIsSavingPrefs(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: data }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      toast.success("Préférences sauvegardées !")
    } catch {
      toast.error("Erreur lors de la mise à jour des préférences")
    } finally {
      setIsSavingPrefs(false)
    }
  }

  async function onChangePassword(data: ChangePasswordInput) {
    setIsChangingPassword(true)
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      toast.success("Mot de passe modifié avec succès !")
      passwordForm.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du changement")
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "SUPPRIMER") return
    try {
      const response = await fetch("/api/user/profile", { method: "DELETE" })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      toast.success("Compte supprimé")
      await signOut({ callbackUrl: "/" })
    } catch {
      toast.error("Erreur lors de la suppression du compte")
    }
  }

  return (
    <div className="space-y-5">
      {/* Email preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Préférences email</h3>
        <p className="text-sm text-gray-400 mb-5">Gérez les notifications que vous recevez</p>
        <form onSubmit={prefsForm.handleSubmit(onSavePreferences)} className="space-y-4">
          {[
            { name: "newJobMatches" as const, label: "Nouvelles offres correspondantes", desc: "Recevoir des alertes pour les offres qui correspondent à votre profil" },
            { name: "applicationUpdates" as const, label: "Mises à jour des candidatures", desc: "Être notifié des changements sur vos candidatures" },
            { name: "weeklyNewsletter" as const, label: "Newsletter hebdomadaire", desc: "Résumé des meilleures offres de la semaine" },
          ].map(({ name, label, desc }) => (
            <div key={name} className="flex items-start gap-3">
              <input
                type="checkbox"
                id={name}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                {...prefsForm.register(name)}
              />
              <div className="flex-1">
                <label htmlFor={name} className="text-sm font-medium text-gray-700 cursor-pointer">{label}</label>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={isSavingPrefs}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50"
          >
            {isSavingPrefs && <Loader2 className="w-4 h-4 animate-spin" />}
            Sauvegarder les préférences
          </button>
        </form>
      </div>

      {/* Change password */}
      {hasPassword && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Changer le mot de passe</h3>
          <p className="text-sm text-gray-400 mb-5">Mettez à jour votre mot de passe</p>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className={labelClass}>Mot de passe actuel</label>
              <input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} className={inputClass} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="newPassword" className={labelClass}>Nouveau mot de passe</label>
              <input id="newPassword" type="password" {...passwordForm.register("newPassword")} className={inputClass} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className={labelClass}>Confirmer le nouveau mot de passe</label>
              <input id="confirmNewPassword" type="password" {...passwordForm.register("confirmNewPassword")} className={inputClass} />
              {passwordForm.formState.errors.confirmNewPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.confirmNewPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50"
            >
              {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              Changer le mot de passe
            </button>
          </form>
        </div>
      )}

      {/* Connected accounts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <MonitorSmartphone className="w-5 h-5 text-gray-400" />
          Comptes connectés
        </h3>
        <div className="mt-4">
          {hasMicrosoft ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 21 21" className="w-6 h-6 shrink-0">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Microsoft</p>
                  <p className="text-xs text-gray-400">Compte Microsoft connecté</p>
                </div>
              </div>
              <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-medium">Connecté</span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucun compte tiers connecté.</p>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-red-700 mb-1 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Zone dangereuse
        </h3>
        <div className="mt-4">
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Supprimer mon compte</p>
                <p className="text-xs text-gray-400">Cette action est irréversible</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors"
              >
                Supprimer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-700 font-medium">
                Tapez <strong>SUPPRIMER</strong> pour confirmer la suppression de votre compte
              </p>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full rounded-lg border border-red-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
              <div className="flex gap-2">
                <button
                  disabled={deleteConfirmText !== "SUPPRIMER"}
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                >
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText("") }}
                  className="border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm rounded-lg px-4 py-2 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
