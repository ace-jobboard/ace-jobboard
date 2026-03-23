import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      type?: string
      message?: string
      email?: string
      page?: string
    }

    const { type, message, email, page } = body

    if (!type || !['bug', 'suggestion'].includes(type)) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
    }
    if (!message || message.trim().length < 5) {
      return NextResponse.json({ error: 'Message trop court (minimum 5 caractères)' }, { status: 400 })
    }

    const session = await auth()
    const userId = session?.user?.id ?? null
    const userEmail = email?.trim() || session?.user?.email || null
    const userAgent = req.headers.get('user-agent') ?? null

    await prisma.feedback.create({
      data: {
        type,
        message: message.trim().slice(0, 5000),
        email: userEmail,
        userId,
        page: page ?? null,
        userAgent,
      },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[Feedback] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
