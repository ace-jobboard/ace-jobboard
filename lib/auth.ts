import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"

/**
 * Get the current session (server-side)
 */
export async function getSession() {
  return await auth()
}

/**
 * Get the current authenticated user with full profile data.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      school: true,
      educationLevel: true,
      graduationYear: true,
      specialization: true,
      phone: true,
      linkedIn: true,
      portfolio: true,
      preferences: true,
      cvUrl: true,
      cvFileName: true,
      cvUploadedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

/**
 * Require authentication. Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  return session
}

/**
 * Get profile completion percentage for a user
 */
export function getProfileCompletion(user: {
  name?: string | null
  school?: string | null
  educationLevel?: string | null
  graduationYear?: number | null
  specialization?: string | null
  phone?: string | null
  image?: string | null
}): number {
  const fields = [
    user.name,
    user.school,
    user.educationLevel,
    user.graduationYear,
    user.specialization,
    user.phone,
    user.image,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}
