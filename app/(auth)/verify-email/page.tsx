import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Vérification email | ACE Job Board",
}

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle>Vérifiez votre email</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          Nous avons envoyé un lien de vérification à votre adresse email.
          Cliquez sur le lien pour activer votre compte.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Pour les tests, votre email est automatiquement vérifié.
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Aller à la connexion</Link>
        </Button>
        <p className="text-xs text-gray-400">
          Vous n&apos;avez pas reçu d&apos;email ? Vérifiez vos spams.
        </p>
      </CardContent>
    </Card>
  )
}
