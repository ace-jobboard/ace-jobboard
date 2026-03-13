"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"

export default function LoginForm() {
  const searchParams = useSearchParams()
  const raw = searchParams.get("callbackUrl") || "/"
  // Sanitize: only use the path, never a full URL (prevents localhost bleed on prod)
  const callbackUrl = raw.startsWith("/") ? raw : "/"
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Email ou mot de passe incorrect")
        return
      }

      toast.success("Connexion réussie !")
      window.location.href = callbackUrl
    } catch {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const isMicrosoftConfigured = !!process.env.NEXT_PUBLIC_AZURE_CONFIGURED

  async function handleMicrosoftLogin() {
    if (!isMicrosoftConfigured) {
      toast.error("La connexion Microsoft n'est pas encore configurée", {
        description: "Utilisez votre email et mot de passe pour vous connecter.",
      })
      return
    }
    setIsMicrosoftLoading(true)
    try {
      await signIn("microsoft-entra-id", { callbackUrl })
    } catch {
      toast.error("Erreur lors de la connexion Microsoft")
      setIsMicrosoftLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Connexion</h2>
        <p className="text-sm text-gray-500 mt-1">Connectez-vous à votre espace étudiant ACE</p>
      </div>

      {/* Microsoft SSO */}
      <button
        type="button"
        onClick={handleMicrosoftLogin}
        disabled={isMicrosoftLoading}
        className={`w-full flex items-center justify-center gap-2.5 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 ${!isMicrosoftConfigured ? "opacity-50" : ""}`}
      >
        {isMicrosoftLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 21 21" className="w-4 h-4 shrink-0" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
        )}
        Se connecter avec Microsoft
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400 tracking-widest">ou</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="vous@ace-education.fr"
            {...register("email")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all duration-150"
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-teal transition-colors duration-150 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all duration-150"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-teal hover:bg-teal-hover text-white font-semibold text-sm rounded-lg py-2.5 transition-colors duration-150 disabled:opacity-60 cursor-pointer"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Se connecter
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-teal hover:text-teal-hover hover:underline transition-colors duration-150">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
