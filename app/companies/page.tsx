import AppShell from "@/components/layout/AppShell"
import EmptyState from "@/components/ui/empty-state"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CompaniesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return (
    <AppShell title="Companies" userName={session.user.name ?? "Admin"}>
      <EmptyState message="Company CRM coming soon" />
    </AppShell>
  )
}
