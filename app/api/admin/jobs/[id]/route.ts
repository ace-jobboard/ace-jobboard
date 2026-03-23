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
  const body = await req.json() as { isActive?: boolean; isApproved?: boolean; memo?: string }

  // At least one field must be provided
  if (
    typeof body.isActive !== "boolean" &&
    typeof body.isApproved !== "boolean" &&
    typeof body.memo !== "string"
  ) {
    return NextResponse.json({ error: "No valid field to update" }, { status: 400 })
  }

  const data: { isActive?: boolean; isApproved?: boolean; memo?: string } = {}
  if (typeof body.isActive === "boolean")   data.isActive   = body.isActive
  if (typeof body.isApproved === "boolean") data.isApproved = body.isApproved
  if (typeof body.memo === "string")        data.memo       = body.memo

  await prisma.job.update({ where: { id }, data })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    // Delete related records first to avoid FK constraint errors
    await prisma.savedJob.deleteMany({ where: { jobId: id } })
    await prisma.jobApplication.deleteMany({ where: { jobId: id } })
    await prisma.job.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/admin/jobs] error:", err)
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
