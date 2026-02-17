import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const filiere = searchParams.get('filiere')
    const niveau = searchParams.get('niveau')
    const region = searchParams.get('region')
    const contractType = searchParams.get('contractType')
    const search = searchParams.get('search')

    const where = {
      ...(filiere && { filiere }),
      ...(niveau && { niveau }),
      ...(region && { region }),
      ...(contractType && { contractType }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors du chargement des offres' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const jobsData = Array.isArray(body) ? body : [body]

    const requiredFields = ['title', 'url']

    for (const job of jobsData) {
      const missing = requiredFields.filter(f => !job[f])
      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Champs manquants: ${missing.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const created = []
    const skipped = []

    for (const job of jobsData) {
      const existing = await prisma.job.findUnique({
        where: { url: job.url },
      })

      if (existing) {
        skipped.push(job.title)
        continue
      }

      const newJob = await prisma.job.create({
        data: {
          title: job.title,
          company: job.company || 'Entreprise non renseignée',
          description: job.description || '',
          location: job.location || '',
          filiere: job.filiere || 'Non classifié',
          niveau: job.niveau || 'Bac+3',
          region: job.region || '',
          contractType: job.contractType || 'Alternance',
          url: job.url,
          source: job.source || 'Adzuna',
        },
      })
      created.push(newJob)
    }

    return NextResponse.json({
      message: `${created.length} offre(s) ajoutée(s), ${skipped.length} doublon(s) ignoré(s)`,
      created: created.length,
      skipped: skipped.length,
      jobs: created,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout des offres' },
      { status: 500 }
    )
  }
}
