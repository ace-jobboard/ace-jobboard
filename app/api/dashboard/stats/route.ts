import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { APIFY_TASKS } from "@/config/tasks"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [totalJobs, activeJobs, pendingApproval, scrapeRun, byFiliere, byContract, bySources] =
    await Promise.all([
      prisma.job.count({ where: { filiere: { not: "_dump" } } }),
      prisma.job.count({ where: { isActive: true, filiere: { not: "_dump" } } }),
      prisma.job.count({ where: { isApproved: false, filiere: { not: "_dump" } } }),
      prisma.scrapeRun.findFirst({ orderBy: { completedAt: "desc" } }),
      prisma.job.groupBy({
        by: ["filiere"],
        _count: true,
        where: { isActive: true, filiere: { not: "_dump" } },
      }),
      prisma.job.groupBy({
        by: ["contractType"],
        _count: true,
        where: { isActive: true, filiere: { not: "_dump" } },
      }),
      prisma.job.groupBy({
        by: ["source"],
        _count: true,
        where: { isActive: true, filiere: { not: "_dump" } },
      }),
    ])

  const lastSync = scrapeRun?.completedAt
    ? new Date(scrapeRun.completedAt).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      })
    : null

  const activeSources = bySources.map((s) => s.source.toUpperCase())

  const tasks = APIFY_TASKS.map((t) => ({
    source:   t.source,
    school:   t.school,
    keyword:  t.keyword,
    taskId:   t.taskId,
    filiere:  t.filiere,
  }))

  return NextResponse.json({
    totalJobs,
    activeJobs,
    pendingApproval,
    jobsByFiliere:  byFiliere.map((r) => ({ filiere: r.filiere, count: r._count })),
    jobsByContract: byContract.map((r) => ({ contractType: r.contractType, count: r._count })),
    lastSync,
    activeSources,
    tasks,
  })
}
