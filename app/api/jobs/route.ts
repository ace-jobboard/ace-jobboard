import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { SCHOOL_FILIERE, SchoolKey } from "@/config/scraping"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Lightweight breakdown mode — returns filiere groupBy counts (no auth required)
    if (searchParams.get("format") === "breakdown") {
      const breakdown = await prisma.job.groupBy({
        by: ["filiere"],
        _count: { id: true },
        where: { isActive: true, NOT: [{ source: "adzuna" }, { filiere: "_dump" }] },
      })
      const total = breakdown.reduce((sum, r) => sum + r._count.id, 0)
      return NextResponse.json({
        breakdown: breakdown.map((r) => ({ filiere: r.filiere, count: r._count.id })),
        total,
      })
    }

    const filiere      = searchParams.get("filiere")
    const school       = searchParams.get("school")   // AMOS, CMH, etc. OR filiere string
    const niveau       = searchParams.get("niveau")
    const region       = searchParams.get("region")
    const location     = searchParams.get("location")
    const contractType = searchParams.get("contract") ?? searchParams.get("contractType")
    const source       = searchParams.get("source")
    const search       = searchParams.get("q") ?? searchParams.get("search")
    const approvedStr  = searchParams.get("approved")
    const publishedSince = searchParams.get("publishedSince")
    const sortField    = searchParams.get("sort") ?? "createdAt"
    const sortDir      = (searchParams.get("dir") ?? "desc") === "asc" ? "asc" : "desc"
    const page         = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit        = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)))
    const skip         = (page - 1) * limit

    // school param → filiere string (try key lookup first, then use as filiere directly)
    const filiereFromSchool =
      school && SCHOOL_FILIERE[school as SchoolKey]
        ? SCHOOL_FILIERE[school as SchoolKey]
        : school ?? filiere

    const where: Prisma.JobWhereInput = {
      isActive:   true,
      NOT: [{ source: 'adzuna' }, { filiere: '_dump' }],
      ...(filiereFromSchool && { filiere: filiereFromSchool }),
      ...(niveau       && { niveau }),
      ...(region       && { region:   { contains: region,   mode: 'insensitive' } }),
      ...(location && {
        OR: [
          { location: { contains: location, mode: 'insensitive' } },
          { region:   { contains: location, mode: 'insensitive' } },
        ],
      }),
      ...(contractType && { contractType }),
      ...(source       && { source }),
      ...(approvedStr !== null && approvedStr !== "" && {
        isApproved: approvedStr === "true",
      }),
      ...(publishedSince && {
        createdAt: { gte: new Date(publishedSince) },
      }),
      ...(search && {
        OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { company:     { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    // Build orderBy — allow common fields
    const allowedSortFields = [
      "title", "company", "contractType", "filiere", "source",
      "location", "createdAt", "isApproved", "isActive",
    ]
    const orderByField = allowedSortFields.includes(sortField) ? sortField : "createdAt"
    const orderBy = { [orderByField]: sortDir } as Prisma.JobOrderByWithRelationInput

    const [rawJobs, total] = await Promise.all([
      prisma.job.findMany({ where, orderBy, skip, take: limit }),
      prisma.job.count({ where }),
    ])

    // Strip rawData (large Apify blobs) before sending to client, serialize dates
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const jobs = rawJobs.map(({ rawData: _rawData, ...rest }) => ({
      ...rest,
      createdAt:   rest.createdAt?.toISOString() ?? null,
      updatedAt:   rest.updatedAt?.toISOString() ?? null,
      firstSeenAt: rest.firstSeenAt?.toISOString() ?? null,
      lastSeenAt:  rest.lastSeenAt?.toISOString() ?? null,
      postedAt:    rest.postedAt?.toISOString() ?? null,
      expiresAt:   rest.expiresAt?.toISOString() ?? null,
    }))

    return NextResponse.json({
      jobs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[api/jobs] GET error:", error)
    return NextResponse.json(
      { error: "Erreur lors du chargement des offres" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key")
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const jobsData = Array.isArray(body) ? body : [body]

    const created = []
    const skipped = []

    for (const job of jobsData) {
      if (!job.title || !job.url) {
        return NextResponse.json({ error: "title and url are required" }, { status: 400 })
      }

      const existing = await prisma.job.findUnique({ where: { url: job.url } })
      if (existing) {
        skipped.push(job.title)
        continue
      }

      const newJob = await prisma.job.create({
        data: {
          title:        job.title,
          company:      job.company      || "Entreprise non renseignée",
          description:  job.description  || "",
          location:     job.location     || "",
          filiere:      job.filiere      || "Non classifié",
          niveau:       job.niveau       || "Bac+3",
          region:       job.region       || "France",
          contractType: job.contractType || "Alternance",
          url:          job.url,
          source:       job.source       || "Manuel",
          sources:      [job.source      || "Manuel"],
        },
      })
      created.push(newJob)
    }

    return NextResponse.json({
      message: `${created.length} offre(s) ajoutée(s), ${skipped.length} doublon(s) ignoré(s)`,
      created: created.length,
      skipped: skipped.length,
      jobs:    created,
    }, { status: 201 })
  } catch (error) {
    console.error("[api/jobs] POST error:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'ajout des offres" },
      { status: 500 }
    )
  }
}
