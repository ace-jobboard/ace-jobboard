import { prisma } from "@/lib/db"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      school: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Utilisateurs</h1>
      <p className="text-sm text-gray-500 mb-6">{users.length} compte{users.length !== 1 ? "s" : ""} enregistré{users.length !== 1 ? "s" : ""}</p>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Nom</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">École</th>
              <th className="text-left px-4 py-3 font-medium">Rôle</th>
              <th className="text-left px-4 py-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-gray-500">{user.school ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "ADMIN"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Aucun utilisateur</div>
        )}
      </div>
    </div>
  )
}
