import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { registerSchema } from "@/lib/validations/auth"
import { lookupStudentByEmail, isAdminEmail } from "@/lib/hubspot/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password } = validated.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // HubSpot data to enrich the user profile
    let hubspotData: {
      school?: string
      phone?: string
      specialization?: string
      hubspotContactId?: string
    } = {}

    if (!isAdminEmail(email)) {
      let hsData = null
      try {
        hsData = await lookupStudentByEmail(email)
      } catch (hsErr) {
        console.error('[Register] HubSpot lookup failed:', hsErr)
        return NextResponse.json(
          { error: "Impossible de vérifier votre inscription. Veuillez réessayer ou contacter votre école." },
          { status: 503 }
        )
      }

      if (!hsData) {
        return NextResponse.json(
          { error: "Votre email n'est pas reconnu dans notre système. Veuillez contacter votre école." },
          { status: 403 }
        )
      }

      hubspotData = {
        school:           hsData.school ?? null,
        phone:            hsData.phone,
        specialization:   hsData.specialization,
        hubspotContactId: hsData.contactId,
      }

      // Cache in StudentWhitelist (TTL: 24h)
      await prisma.studentWhitelist.upsert({
        where: { email },
        create: {
          email,
          school:           hsData.school ?? null,
          hubspotContactId: hsData.contactId,
          expiresAt: new Date(Date.now() + 86_400_000),
        },
        update: {
          school:     hsData.school ?? null,
          verifiedAt: new Date(),
          expiresAt:  new Date(Date.now() + 86_400_000),
        },
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password:      hashedPassword,
        emailVerified: new Date(),
        // HubSpot-enriched fields (only set if present)
        ...(hubspotData.school         && { school:         hubspotData.school }),
        ...(hubspotData.phone          && { phone:          hubspotData.phone }),
        ...(hubspotData.specialization && { specialization: hubspotData.specialization }),
      },
    })

    console.log(`[Register] New user: ${email} | school: ${hubspotData.school ?? 'admin'} | hs: ${hubspotData.hubspotContactId ?? '-'}`)

    return NextResponse.json(
      { message: "Compte créé avec succès", userId: user.id },
      { status: 201 }
    )
  } catch (err) {
    console.error('[Register] Unexpected error:', err)
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    )
  }
}
