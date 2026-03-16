"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import AvatarCircle from "@/components/ui/avatar-circle"

interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  school: string | null
  createdAt: string
  _count: { savedJobs: number }
}

interface Props {
  initialUsers: UserRow[]
  initialTotal: number
  currentUserId: string
}

export default function UsersTable({ initialUsers, initialTotal, currentUserId }: Props) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const filteredUsers = search.trim()
    ? users.filter(
        (u) =>
          (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const handleRoleToggle = useCallback(
    async (user: UserRow) => {
      const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
      setTogglingId(user.id)
      try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        })
        if (!res.ok) {
          const data = await res.json() as { error?: string }
          toast.error(data.error ?? "Failed to update role")
          return
        }
        setUsers((prev) =>
          prev.map((u2) => (u2.id === user.id ? { ...u2, role: newRole } : u2))
        )
        toast.success(`${user.name ?? user.email} is now ${newRole}`)
      } catch {
        toast.error("Failed to update role")
      } finally {
        setTogglingId(null)
      }
    },
    []
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
        />
        <p className="text-xs text-gray-400 ml-auto">
          {initialTotal} user{initialTotal !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">School</th>
                <th className="text-left px-4 py-3 font-medium">Saved</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AvatarCircle name={user.name ?? user.email} size="sm" />
                        <span className="font-medium text-gray-900 truncate max-w-[140px]">
                          {user.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[180px]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-navy/10 text-navy"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.school ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user._count.savedJobs}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {user.id === currentUserId ? (
                        <span className="text-xs text-gray-400 italic">You</span>
                      ) : (
                        <button
                          onClick={() => void handleRoleToggle(user)}
                          disabled={togglingId === user.id}
                          className="px-2.5 py-1 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                        >
                          {togglingId === user.id
                            ? "…"
                            : user.role === "ADMIN"
                            ? "→ User"
                            : "→ Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
