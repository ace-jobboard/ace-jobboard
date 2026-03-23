import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { Prisma, UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q        = searchParams.get("q") ?? ""
  const role     = searchParams.get("role") ?? ""
  const school   = searchParams.get("school") ?? ""
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "25", 10)))
  const skip     = (page - 1) * pageSize

  const where: Prisma.UserWhereInput = {
    ...(q && {
      OR: [
        { name:  { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(role   && { role: role as UserRole }),
    ...(school && { school }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        school:    true,
        createdAt: true,
        _count: { select: { savedJobs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, total })
}
