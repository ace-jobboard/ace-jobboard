import { getCurrentUser, getProfileCompletion } from "@/lib/auth"
import ProfileForm from "@/components/dashboard/ProfileForm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { redirect } from "next/navigation"

// Colors match the main site's filière palette
const schoolBadgeColors: Record<string, string> = {
  AMOS:  "bg-green-50 text-green-700 ring-1 ring-green-100",
  CMH:   "bg-blue-50 text-blue-900 ring-1 ring-blue-200",
  EIDM:  "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
  ESDAC: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  ENAAI: "bg-red-50 text-red-700 ring-1 ring-red-100",
}

const schoolAccentBorder: Record<string, string> = {
  AMOS:  "border-t-green-500",
  CMH:   "border-t-blue-900",
  EIDM:  "border-t-purple-500",
  ESDAC: "border-t-orange-500",
  ENAAI: "border-t-red-500",
}

const schoolAvatarBg: Record<string, string> = {
  AMOS:  "bg-green-600",
  CMH:   "bg-blue-900",
  EIDM:  "bg-purple-600",
  ESDAC: "bg-orange-500",
  ENAAI: "bg-red-600",
}

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const completionPercent = getProfileCompletion(user)

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase()

  const accentBorder = user.school ? (schoolAccentBorder[user.school] ?? "border-t-gray-300") : "border-t-gray-300"
  const avatarBg = user.school ? (schoolAvatarBg[user.school] ?? "bg-gray-500") : "bg-gray-500"

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Profile header */}
      <div className={`bg-white rounded-2xl border border-gray-100 border-t-4 ${accentBorder} shadow-sm p-6`}>
        <div className="flex items-start gap-4">
          <Avatar className={`h-16 w-16 text-white font-bold text-xl ${avatarBg}`}>
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback className={`text-white font-bold text-xl ${avatarBg}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">
              {user.name || "Étudiant ACE"}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {user.school && (
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${schoolBadgeColors[user.school] ?? "bg-gray-100 text-gray-700"}`}>
                  {user.school}
                </span>
              )}
              {user.educationLevel && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                  {user.educationLevel}
                </span>
              )}
              {user.graduationYear && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                  Promo {user.graduationYear}
                </span>
              )}
            </div>
          </div>
          {/* Completion pill */}
          <div className="shrink-0 text-right">
            <div className="text-2xl font-extrabold text-gray-900">{completionPercent}%</div>
            <div className="text-xs text-gray-400">profil complété</div>
            <div className="mt-2 w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-full transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editable form */}
      <ProfileForm user={user} completionPercent={completionPercent} />
    </div>
  )
}
