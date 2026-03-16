import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ results: [] })

  const results = await prisma.job.findMany({
    where: {
      isActive: true,
      filiere: { not: '_dump' },
      OR: [
        { title:   { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, title: true, company: true, filiere: true, contractType: true },
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ results })
}
