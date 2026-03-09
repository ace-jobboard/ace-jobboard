import { prisma } from "@/lib/db"
import JobsTable from "./JobsTable"

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    select: {
      id: true,
      title: true,
      company: true,
      filiere: true,
      region: true,
      contractType: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const serialized = jobs.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() }))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Offres</h1>
      <p className="text-sm text-gray-500 mb-6">Gérer la visibilité des offres</p>
      <JobsTable initialJobs={serialized} />
    </div>
  )
}
