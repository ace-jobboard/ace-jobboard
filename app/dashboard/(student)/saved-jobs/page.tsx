import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import SavedJobsGrid from "@/components/dashboard/SavedJobsGrid"
import { Bookmark } from "lucide-react"

export const metadata = {
  title: "Offres sauvegardées | Dashboard",
}

export default async function SavedJobsPage() {
  const session = await requireAuth()

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    include: { job: true },
    orderBy: { savedAt: "desc" },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobs = savedJobs.map((s) => ({ ...s.job, savedAt: s.savedAt })) as any[]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 animate-fade-up">
        <Bookmark className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">
          Mes offres sauvegardées
        </h2>
        <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {jobs.length} offre{jobs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <SavedJobsGrid initialJobs={jobs} />
    </div>
  )
}
