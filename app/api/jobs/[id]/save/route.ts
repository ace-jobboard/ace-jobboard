import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id: jobId } = await params

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) {
    return NextResponse.json({ error: "Offre introuvable" }, { status: 404 })
  }

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: session.user.id, jobId } },
  })

  if (existing) {
    // Unsave
    await prisma.savedJob.delete({
      where: { userId_jobId: { userId: session.user.id, jobId } },
    })
    return NextResponse.json({ saved: false })
  } else {
    // Save
    await prisma.savedJob.create({
      data: { userId: session.user.id, jobId },
    })
    return NextResponse.json({ saved: true })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ saved: false })
  }

  const { id: jobId } = await params

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: session.user.id, jobId } },
  })

  return NextResponse.json({ saved: !!existing })
}
