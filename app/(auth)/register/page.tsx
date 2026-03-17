import { Suspense } from "react"
import RegisterForm from "@/components/auth/RegisterForm"

export const metadata = {
  title: "Créer un compte | ACE Job Board",
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500">Chargement...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
