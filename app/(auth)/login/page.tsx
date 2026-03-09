import { Suspense } from "react"
import LoginForm from "@/components/auth/LoginForm"

export const metadata = {
  title: "Connexion | ACE Job Board",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  )
}
