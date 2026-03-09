import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json() as { isActive?: boolean }

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be boolean" }, { status: 400 })
  }

  await prisma.job.update({
    where: { id },
    data: { isActive: body.isActive },
  })

  return NextResponse.json({ ok: true })
}
