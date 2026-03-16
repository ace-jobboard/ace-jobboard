import AppShell from "@/components/layout/AppShell"
import EmptyState from "@/components/ui/empty-state"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminConfigPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/dashboard")
  return (
    <AppShell title="Config" userName={session.user.name ?? "Admin"}>
      <EmptyState message="Platform configuration coming soon" />
    </AppShell>
  )
}
