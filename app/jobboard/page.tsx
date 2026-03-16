import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import JobboardClient from "./JobboardClient"

export default async function JobBoardPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const userSchool = (session?.user as { school?: string | null } | undefined)?.school ?? null

  const [initialJobsRaw, initialTotal] = await Promise.all([
    prisma.job.findMany({
      where: {
        isActive: true,
        filiere: { not: "_dump" },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        location: true,
        filiere: true,
        niveau: true,
        region: true,
        contractType: true,
        url: true,
        source: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.job.count({
      where: {
        isActive: true,
        filiere: { not: "_dump" },
      },
    }),
  ])

  // Serialize dates for client
  const initialJobs = initialJobsRaw.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }))

  return (
    <JobboardClient
      isLoggedIn={isLoggedIn}
      userSchool={userSchool}
      initialJobs={initialJobs}
      initialTotal={initialTotal}
    />
  )
}
