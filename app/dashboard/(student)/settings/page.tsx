import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import SettingsForm from "@/components/dashboard/SettingsForm"

export const metadata = {
  title: "Paramètres | Dashboard",
}

export default async function SettingsPage() {
  const session = await requireAuth()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      password: true,
      preferences: true,
      accounts: {
        select: { provider: true },
      },
    },
  })

  if (!user) redirect("/login")

  const hasMicrosoft = user.accounts.some(
    (a) => a.provider === "microsoft-entra-id"
  )

  const preferences = (user.preferences as Record<string, boolean>) ?? {}

  return (
    <div>
      <SettingsForm
        hasPassword={!!user.password}
        hasMicrosoft={hasMicrosoft}
        preferences={preferences}
      />
    </div>
  )
}
