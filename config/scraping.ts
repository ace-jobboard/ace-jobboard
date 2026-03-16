export const COMPETITOR_SCHOOLS = [
  "IFAE Business School",
  "IFAE",
  "ISCOD",
  "Galileo Global Education",
  "ESG Sport",
  "WIN Sport School",
  "Win Sport School",
  "NUEVO CFA",
  "Pigier",
  "ALTICOME",
  "Prisma Formations",
  "STAND UP FORMATION",
  "Stand Up Formation",
  // Common patterns used by training orgs disguising as employers
  "Ecole de",
  "École de",
  "CFA ",
  "Institut de Formation",
]

export const COMPETITOR_DESCRIPTION_PHRASES = [
  "notre partenaire école",
  "notre école partenaire",
  "formation diplômante",
  "école de commerce",
  "centre de formation",
  "en partenariat avec",
  "notre partenaire académique",
  "frais de scolarité",
  "frais d'inscription",
  "coût de formation",
]

// Merged, deduplicated competitor lists (used by fetch-tasks.ts)
export const COMPETITOR_COMPANIES: string[] = [
  'ifae', 'iscod', 'galileo', 'esg sport', 'win sport school',
  'nuevo cfa', 'pigier', 'alticome', 'prisma formations',
  'stand up formation', 'efrei', 'epitech', 'supinfo',
  'ecole de', 'école de', 'cfa ', 'institut de formation',
  'centre de formation',
]

export const COMPETITOR_PHRASES: string[] = [
  'notre partenaire école', 'notre école partenaire',
  'formation diplômante', 'école de commerce',
  'centre de formation', 'frais de scolarité',
  "frais d'inscription", 'rejoignez notre école',
  'intégrez notre formation', 'devenez étudiant',
  'recrutement étudiant', 'bachelor en alternance chez nous',
  'en partenariat avec', 'notre partenaire académique',
  'coût de formation',
]

export type SchoolKey = "AMOS" | "CMH" | "EIDM" | "ESDAC" | "ENAAI"
export type SourceKey = "linkedin" | "indeed" | "wttj"

export interface SourceConfig {
  actorId: string
  keywords: string[]
  location: string
  maxResults: number
}

export interface SchoolConfig {
  name: string
  filiere: string
  sources: Partial<Record<SourceKey, SourceConfig>>
}

// ─── Verified actor IDs ───────────────────────────────────────────────────────
// harvestapi/linkedin-job-search  — pay per event, returns full descriptions
// shahidirfan/Jungle-Job-Scraper  — $1/1000 results, WTTJ with contract filter
// misceres/indeed-scraper         — compute only, keyword + country based

export const SCRAPING_CONFIG: Record<SchoolKey, SchoolConfig> = {
  AMOS: {
    name: "AMOS Sport Management",
    filiere: "Sport Management",
    sources: {
      linkedin: {
        actorId: "harvestapi/linkedin-job-search",
        keywords: [
          "alternance marketing sportif France",
          "alternance événementiel sportif France",
          "alternance coordinateur sport France",
        ],
        location: "France",
        maxResults: 30,
      },
      wttj: {
        actorId: "shahidirfan/Jungle-Job-Scraper",
        keywords: [
          "marketing sportif",
          "événementiel sportif",
          "coordinateur sportif",
        ],
        location: "France",
        maxResults: 30,
      },
      indeed: {
        actorId: "misceres/indeed-scraper",
        keywords: [
          "alternance marketing sportif",
          "alternance événementiel sport",
        ],
        location: "France",
        maxResults: 30,
      },
    },
  },

  CMH: {
    name: "CMH Hôtellerie & Luxe",
    filiere: "Hôtellerie & Luxe",
    sources: {
      linkedin: {
        actorId: "harvestapi/linkedin-job-search",
        keywords: [
          "alternance hôtellerie luxe France",
          "alternance réceptionniste hôtel France",
          "alternance revenue management hôtel France",
        ],
        location: "France",
        maxResults: 30,
      },
      wttj: {
        actorId: "shahidirfan/Jungle-Job-Scraper",
        keywords: [
          "hôtellerie alternance",
          "réceptionniste hôtel",
          "luxe hospitality",
        ],
        location: "France",
        maxResults: 30,
      },
      indeed: {
        actorId: "misceres/indeed-scraper",
        keywords: [
          "alternance hôtellerie",
          "alternance restauration luxe",
        ],
        location: "France",
        maxResults: 30,
      },
    },
  },

  EIDM: {
    name: "EIDM Mode & Luxe",
    filiere: "Mode & Luxe",
    sources: {
      linkedin: {
        actorId: "harvestapi/linkedin-job-search",
        keywords: [
          "alternance mode luxe France",
          "alternance retail luxe France",
          "alternance fashion merchandising France",
        ],
        location: "France",
        maxResults: 30,
      },
      wttj: {
        actorId: "shahidirfan/Jungle-Job-Scraper",
        keywords: [
          "mode alternance",
          "retail luxe",
          "fashion merchandising",
        ],
        location: "France",
        maxResults: 30,
      },
      indeed: {
        actorId: "misceres/indeed-scraper",
        keywords: [
          "alternance mode",
          "alternance luxe retail",
        ],
        location: "France",
        maxResults: 30,
      },
    },
  },

  ESDAC: {
    name: "ESDAC Design",
    filiere: "Design",
    sources: {
      linkedin: {
        actorId: "harvestapi/linkedin-job-search",
        keywords: [
          "alternance designer graphique France",
          "alternance UX UI France",
          "alternance direction artistique France",
        ],
        location: "France",
        maxResults: 30,
      },
      wttj: {
        actorId: "shahidirfan/Jungle-Job-Scraper",
        keywords: [
          "graphisme alternance",
          "UX designer alternance",
          "direction artistique",
        ],
        location: "France",
        maxResults: 30,
      },
      indeed: {
        actorId: "misceres/indeed-scraper",
        keywords: [
          "alternance graphisme",
          "alternance design UX",
        ],
        location: "France",
        maxResults: 30,
      },
    },
  },

  ENAAI: {
    name: "ENAAI Illustration & Animation",
    filiere: "Illustration & Animation",
    sources: {
      linkedin: {
        actorId: "harvestapi/linkedin-job-search",
        keywords: [
          "alternance motion design France",
          "alternance illustration France",
          "alternance animation 2D 3D France",
        ],
        location: "France",
        maxResults: 30,
      },
      wttj: {
        actorId: "shahidirfan/Jungle-Job-Scraper",
        keywords: [
          "motion design",
          "illustration alternance",
          "animation 2D 3D",
        ],
        location: "France",
        maxResults: 30,
      },
      indeed: {
        actorId: "misceres/indeed-scraper",
        keywords: [
          "alternance motion design",
          "alternance illustration",
        ],
        location: "France",
        maxResults: 30,
      },
    },
  },
}

// Vercel cron schedule per school (Pro plan required)
export const SCRAPE_SCHEDULE: Record<SchoolKey, string> = {
  AMOS:  "0 6 * * *",   // 6 AM
  CMH:   "0 7 * * *",   // 7 AM
  EIDM:  "0 8 * * *",   // 8 AM
  ESDAC: "0 9 * * *",   // 9 AM
  ENAAI: "0 10 * * *",  // 10 AM
}

export const FRENCH_REGIONS = [
  "Île-de-France",
  "Auvergne-Rhône-Alpes",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Hauts-de-France",
  "Grand Est",
  "Pays de la Loire",
  "Bretagne",
  "Normandie",
  "Provence-Alpes-Côte d'Azur",
  "Bourgogne-Franche-Comté",
  "Centre-Val de Loire",
  "Corse",
  "Paris",
  "Lyon",
  "Marseille",
  "Bordeaux",
  "Toulouse",
  "Nantes",
  "Strasbourg",
  "Lille",
  "Montpellier",
  "Rennes",
  "Grenoble",
  "Nice",
]

// Helper: map school key → filiere string
export const SCHOOL_FILIERE: Record<SchoolKey, string> = Object.fromEntries(
  (Object.entries(SCRAPING_CONFIG) as [SchoolKey, SchoolConfig][]).map(([k, v]) => [k, v.filiere])
) as Record<SchoolKey, string>
