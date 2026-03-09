import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    include: {
      job: true,
    },
    orderBy: { savedAt: "desc" },
  })

  return NextResponse.json(savedJobs.map((s) => ({ ...s.job, savedAt: s.savedAt })))
}
