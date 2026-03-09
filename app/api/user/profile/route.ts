import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { profileSchema } from "@/lib/validations/user"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
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
      preferences: true,
      cvUrl: true,
      cvFileName: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Handle preferences update separately
    if (body.preferences !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { preferences: body.preferences },
      })
      return NextResponse.json({ message: "Préférences mises à jour" })
    }

    const validated = profileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const data = validated.data
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name || null
    if (data.school !== undefined) updateData.school = data.school || null
    if (data.educationLevel !== undefined) updateData.educationLevel = data.educationLevel || null
    if (data.graduationYear !== undefined) updateData.graduationYear = data.graduationYear
    if (data.specialization !== undefined) updateData.specialization = data.specialization || null
    if (data.phone !== undefined) updateData.phone = data.phone || null

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        school: true,
        educationLevel: true,
        graduationYear: true,
        specialization: true,
        phone: true,
      },
    })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    await prisma.user.delete({ where: { id: session.user.id } })
    return NextResponse.json({ message: "Compte supprimé avec succès" })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    )
  }
}
