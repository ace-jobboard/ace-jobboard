import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import AppShell from "@/components/layout/AppShell"
import UsersTable from "@/components/admin/UsersTable"

export const metadata = {
  title: "Users | Admin",
}

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/dashboard")

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        school:    true,
        createdAt: true,
        _count: { select: { savedJobs: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.user.count(),
  ])

  // Serialize dates for client component
  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }))

  const currentUserId = (session.user as { id?: string }).id ?? ""

  return (
    <AppShell title="Users" userName={session.user.name ?? "Admin"}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {total} compte{total !== 1 ? "s" : ""} enregistré{total !== 1 ? "s" : ""}
        </p>
      </div>
      <UsersTable
        initialUsers={serializedUsers}
        initialTotal={total}
        currentUserId={currentUserId}
      />
    </AppShell>
  )
}
