import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { changePasswordSchema } from "@/lib/validations/user"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = changePasswordSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user?.password) {
      return NextResponse.json(
        { error: "Aucun mot de passe défini (compte OAuth)" },
        { status: 400 }
      )
    }

    const isCurrentValid = await bcrypt.compare(
      validated.data.currentPassword,
      user.password
    )

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 400 }
      )
    }

    const hashedNew = await bcrypt.hash(validated.data.newPassword, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNew },
    })

    return NextResponse.json({ message: "Mot de passe modifié avec succès" })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    )
  }
}
