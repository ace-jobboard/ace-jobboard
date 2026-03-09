import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ─── Classification rules ────────────────────────────────────────────────────
// Each rule has:
//   title: any single match in job title → assign this filiere (high confidence)
//   desc:  needs 2+ matches in description (title had no match)
// Rules are checked in order — first match wins.

const RULES: Array<{ filiere: string; title: string[]; desc: string[] }> = [
  {
    filiere: 'Illustration & Animation',
    title: [
      'illustrateur', 'illustration', 'motion design', 'motion designer',
      'animateur 2d', 'animateur 3d', 'animation 2d', 'animation 3d',
      'concept art', 'storyboard', '3d artist', '2d artist', 'artiste 3d',
      'artiste 2d', 'compositeur', 'character design',
    ],
    desc: [
      'after effects', 'blender', 'maya', 'cinema 4d', 'motion design',
      'storyboard', 'concept art', 'animation 2d', 'animation 3d',
    ],
  },
  {
    filiere: 'Design',
    title: [
      'ux designer', 'ui designer', 'ux/ui', 'ui/ux', 'graphiste',
      'graphisme', 'web designer', 'product designer', 'graphic designer',
      'designer graphique', 'designer ui', 'designer ux', 'designer produit',
      'direction artistique', 'directeur artistique', 'branding',
      'identité visuelle', 'designer packaging', 'designer industriel',
      'designer intérieur', 'visual designer',
    ],
    desc: [
      'figma', 'sketch', 'adobe xd', 'wireframe', 'prototype',
      'maquette graphique', 'charte graphique', 'identité visuelle',
      'expérience utilisateur', 'interface utilisateur',
    ],
  },
  {
    filiere: 'Hôtellerie & Luxe',
    title: [
      'hôtelier', 'hôtellerie', 'réceptionniste', 'réception hôtel',
      'concierge', 'chef de réception', 'palace', 'resort',
      'revenue manager', 'yield manager', 'hospitality',
      'food and beverage', 'f&b', 'sommelier', 'maître d',
      'chef de rang', 'chef cuisinier', 'chef de cuisine',
      'second de cuisine', 'sous-chef', 'responsable restauration',
      'directeur hôtel', 'directeur de restaurant', 'spa manager',
      'gouvernante', 'bagagiste', 'night audit', 'front desk',
    ],
    desc: [
      'hôtel', 'palace', 'resort', 'revenue management', 'yield management',
      'hospitality', 'réception hôtelière', 'restauration gastronomique',
      'conciergerie', 'service en salle',
    ],
  },
  {
    filiere: 'Mode & Luxe',
    title: [
      'styliste', 'fashion', 'textile', 'maroquinerie',
      'prêt-à-porter', 'haute couture', 'couturier', 'couturière',
      'merchandising mode', 'acheteur mode', 'showroom',
      'chef de produit mode', 'chef produit mode',
      'coordinateur mode', 'coordinatrice mode',
      'assistant acheteur', 'visual merchandiser',
    ],
    desc: [
      'prêt-à-porter', 'maroquinerie', 'fashion week', 'showroom mode',
      'stylisme', 'collection mode', 'couturier', 'haute couture',
    ],
  },
  {
    filiere: 'Sport Management',
    title: [
      'sport management', 'marketing sportif', 'événementiel sportif',
      'chargé de sport', 'coordinateur sportif', 'manager sportif',
      'développeur sport', 'business developer sport',
      'directeur sportif', 'responsable sportif',
      'community manager sport', 'analyste sport', 'data sport',
      'fédération', 'club sportif', 'stade', 'arena', 'esport',
      'ligue sportive', 'sponsoring sport', 'partenariat sport',
    ],
    desc: [
      'club sportif', 'fédération sportive', 'marketing sportif',
      'événementiel sportif', 'partenariat sportif', 'esport',
      'stade', 'compétition sportive',
    ],
  },
]

function detectFiliere(title: string, description: string): string | null {
  const t = title.toLowerCase()
  const d = description.toLowerCase()

  for (const rule of RULES) {
    if (rule.title.some(kw => t.includes(kw))) return rule.filiere
  }
  for (const rule of RULES) {
    if (rule.desc.filter(kw => d.includes(kw)).length >= 2) return rule.filiere
  }
  return null
}

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, title: true, description: true, filiere: true, isActive: true },
  })

  console.log(`Checking ${jobs.length} jobs...\n`)

  let relabeled = 0
  let hidden = 0
  let unchanged = 0

  for (const job of jobs) {
    const detected = detectFiliere(job.title, job.description)

    if (!detected) {
      // No filiere match — hide from site
      if (job.isActive) {
        await prisma.job.update({ where: { id: job.id }, data: { isActive: false } })
        console.log(`[HIDE]    "${job.title.slice(0, 60)}"`)
        hidden++
      }
    } else if (detected !== job.filiere) {
      // Wrong filiere — correct it
      await prisma.job.update({ where: { id: job.id }, data: { filiere: detected, isActive: true } })
      console.log(`[RELABEL] "${job.title.slice(0, 60)}"`)
      console.log(`          ${job.filiere} → ${detected}`)
      relabeled++
    } else {
      unchanged++
    }
  }

  console.log(`\n✅ Done`)
  console.log(`   Relabeled: ${relabeled}`)
  console.log(`   Hidden:    ${hidden}`)
  console.log(`   Unchanged: ${unchanged}`)

  await prisma.$disconnect()
}

main().catch(console.error)
