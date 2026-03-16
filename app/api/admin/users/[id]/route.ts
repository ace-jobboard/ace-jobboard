import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Cannot change own role
  if ((session.user as { id?: string }).id === id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 403 })
  }

  const body = await request.json() as { role?: string }
  if (body.role !== "ADMIN" && body.role !== "USER") {
    return NextResponse.json({ error: "Invalid role. Must be ADMIN or USER" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data:  { role: body.role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(user)
}
