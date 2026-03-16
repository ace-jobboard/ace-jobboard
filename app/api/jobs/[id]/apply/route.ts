import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ applied: false })
  const { id } = await params
  const app = await prisma.jobApplication.findUnique({
    where: { userId_jobId: { userId: session.user.id, jobId: id } },
  })
  return NextResponse.json({ applied: !!app, status: app?.status ?? null })
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const existing = await prisma.jobApplication.findUnique({
    where: { userId_jobId: { userId: session.user.id, jobId: id } },
  })
  if (existing) {
    await prisma.jobApplication.delete({
      where: { userId_jobId: { userId: session.user.id, jobId: id } },
    })
    return NextResponse.json({ applied: false })
  }
  await prisma.jobApplication.create({
    data: { userId: session.user.id, jobId: id },
  })
  return NextResponse.json({ applied: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { status } = await req.json() as { status: string }
  const app = await prisma.jobApplication.update({
    where: { userId_jobId: { userId: session.user.id, jobId: id } },
    data: { status },
  })
  return NextResponse.json({ applied: true, status: app.status })
}
