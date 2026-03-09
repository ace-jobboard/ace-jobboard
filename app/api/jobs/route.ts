import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { SCHOOL_FILIERE, SchoolKey } from "@/config/scraping"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const filiere      = searchParams.get("filiere")
    const school       = searchParams.get("school")   // alternative: AMOS, CMH, etc.
    const niveau       = searchParams.get("niveau")
    const region       = searchParams.get("region")
    const contractType = searchParams.get("contractType")
    const search       = searchParams.get("search")
    const page         = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit        = Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    const skip         = (page - 1) * limit

    // school param → filiere string
    const filiereFilter =
      school && SCHOOL_FILIERE[school as SchoolKey]
        ? SCHOOL_FILIERE[school as SchoolKey]
        : filiere

    const where = {
      isActive:   true,
      isApproved: true,
      ...(filiereFilter && { filiere: filiereFilter }),
      ...(niveau       && { niveau }),
      ...(region       && { region }),
      ...(contractType && { contractType }),
      ...(search && {
        OR: [
          { title:   { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [rawJobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    // Strip rawData (large Apify blobs) before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const jobs = rawJobs.map(({ rawData: _rawData, ...rest }) => rest)

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
