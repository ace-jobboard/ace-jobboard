import { prisma } from "@/lib/db"
import { ProcessedJob } from "./processor"

export interface UpsertResult {
  saved: number
  duplicates: number
  jobs: Array<{ id: string; isNew: boolean }>
}

/**
 * Upserts a batch of processed jobs into the database.
 *
 * Strategy:
 *  - Primary dedup key: `url` (unique per job board listing)
 *  - If a job with the same URL already exists:
 *      • update lastSeenAt
 *      • add source to sources[] if not already present
 *  - If it's new, insert with all fields
 */
export async function upsertJobs(
  jobs: ProcessedJob[],
  source: string
): Promise<UpsertResult> {
  let saved = 0
  let duplicates = 0
  const results: Array<{ id: string; isNew: boolean }> = []

  for (const job of jobs) {
    try {
      const existing = await prisma.job.findUnique({ where: { url: job.url } })

      if (existing) {
        // Update tracking fields only
        const updatedSources = existing.sources.includes(source)
          ? existing.sources
          : [...existing.sources, source]

        await prisma.job.update({
          where: { id: existing.id },
          data: {
            lastSeenAt: new Date(),
            sources: updatedSources,
          },
        })

        duplicates++
        results.push({ id: existing.id, isNew: false })
      } else {
        const created = await prisma.job.create({
          data: {
            title:        job.title,
            company:      job.company,
            description:  job.description,
            location:     job.location,
            region:       job.region,
            filiere:      job.filiere,
            niveau:       job.niveau,
            contractType: job.contractType,
            url:          job.url,
            source:       job.source,
            sources:      [job.source],
            apifyActorId: job.apifyActorId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rawData:      job.rawData as any,
            isApproved:   true,
            isActive:     true,
          },
        })

        saved++
        results.push({ id: created.id, isNew: true })
      }
    } catch (err) {
      // Log and skip individual failures so the batch continues
      console.error("[dedup] Failed to upsert job:", job.url, err)
    }
  }

  return { saved, duplicates, jobs: results }
}

/**
 * Marks jobs that haven't been seen in X days as inactive.
 * Useful for expiring stale listings.
 */
export async function deactivateStalJobs(olderThanDays = 30): Promise<number> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - olderThanDays)

  const result = await prisma.job.updateMany({
    where: {
      isActive: true,
      lastSeenAt: { lt: cutoff },
    },
    data: { isActive: false },
  })

  return result.count
}
