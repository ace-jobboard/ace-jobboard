/**
 * Job classification engine.
 *
 * Classifies a raw job into one of the five ACE filieres based on title
 * keywords, or routes it to DUMP_FILIERE if no confident match is found.
 * Dump jobs are stored in the DB but hidden from end users.
 */

export const DUMP_FILIERE = '_dump'

// ---------------------------------------------------------------------------
// Title-level hard blocks
// Jobs whose title matches any of these are always dumped, regardless of
// which Apify task they came from.
// ---------------------------------------------------------------------------
const BLOCKED_TITLE_KEYWORDS = [
  // Tech / dev
  'data scientist', 'software engineer', 'développeur', 'developer',
  'devops', 'full stack', 'fullstack', 'backend', 'frontend',
  'data analyst', 'data engineer', 'machine learning', 'ai engineer',
  'ingénieur logiciel', 'ingénieur données', 'ingénieur ia',
  'chef de projet web', 'chef de projet it', 'chef de projet digital',
  'product manager', 'product owner', 'scrum master',
  // Finance / legal
  'comptable', 'juriste', 'avocat', 'financial controller',
  'contrôleur financier', 'analyste financier', 'originateur',
  'asset manager', 'portfolio manager', 'analyste crédit',
  // Clearly off-topic
  'cryogenic', 'thermal engineer', 'ingénieur thermique',
  'recruteur', 'chargé de recrutement', 'talent acquisition',
  'ingénieur cryogénie', 'growth hacker',
]

// ---------------------------------------------------------------------------
// Title keywords per filiere
// A job must match at least one of these in its title to be classified into
// the corresponding filiere. These are intentionally stricter than the
// description-level SCHOOL_RELEVANCE_KEYWORDS used during Apify scraping.
// ---------------------------------------------------------------------------
export const FILIERE_TITLE_KEYWORDS: Record<string, string[]> = {
  'Sport Management': [
    'sport', 'sportif', 'sportive', 'sportifs',
    'football', 'rugby', 'basket', 'tennis', 'natation', 'athlétisme',
    'fitness', 'événementiel sport', 'marketing sport', 'communication sport',
    'fédération sportive', 'club sport', 'ligue', 'stade', 'arena',
    'esport', 'e-sport', 'sponsoring sport', 'sponsoring',
    'athlète', 'athletic', 'olympique', 'paralympique',
    'management sportif', 'coordinateur sport',
  ],
  'Hôtellerie & Luxe': [
    'hôtel', 'hotel', 'hôtellerie', 'hotellerie',
    'restauration', 'restaurant', 'réception', 'réceptionniste',
    'concierge', 'palace', 'resort', 'f&b', 'food and beverage',
    'sommelier', 'revenue management', 'hospitality',
    'gastronomie', 'gastronomique', "maître d'hôtel",
    'chef de rang', 'barman', 'barmaid', 'serveur', 'serveuse',
    'boulangerie', 'pâtisserie', 'cuisinier', 'cuisine', 'chef cuisinier',
    'événementiel luxe', 'marketing luxe', 'réception hôtellerie',
  ],
  'Mode & Luxe': [
    'mode', 'fashion', 'styliste', 'stylisme',
    'maroquinerie', 'prêt-à-porter', 'couture', 'couturier',
    'merchandising', 'acheteur mode', 'acheteur',
    'showroom', 'collection mode', 'vêtement', 'accessoire',
    'bijou', 'joaillerie', 'bijouterie', 'orfèvrerie',
    'parfum', 'parfumerie', 'cosmétique', 'beauté luxe',
    'haute couture', 'retail luxe', 'luxe mode',
  ],
  'Design': [
    'graphiste', 'graphisme',
    'ux designer', 'ui designer', 'ux/ui', 'ux ui',
    'direction artistique', 'directeur artistique', 'directrice artistique',
    'web designer', 'branding', 'identité visuelle',
    'motion design', 'motion designer',
    'monteur', 'monteuse', 'montage vidéo',
    'réalisateur', 'réalisatrice',
    'design graphique', 'designer graphique',
    'infographiste', 'maquettiste',
    'directeur de création',
  ],
  'Illustration & Animation': [
    'illustration', 'illustrateur', 'illustratrice',
    'animation 2d', 'animation 3d', 'animateur 2d', 'animateur 3d',
    'motion design', 'motion designer',
    'after effects', 'blender', 'maya',
    'concept art', 'concept artist', 'storyboard',
    'jeu vidéo', 'jeux vidéo', 'game artist', 'game designer',
    'animator', 'bande dessinée', 'manga',
    'character design', 'modélisation 3d',
  ],
}

// ---------------------------------------------------------------------------
// Classifier
// ---------------------------------------------------------------------------

/**
 * Returns the best matching filiere for a job, or DUMP_FILIERE if no
 * confident match is found.
 *
 * Strategy (in order):
 *  1. Hard-block by title keyword → dump
 *  2. Title match against task's own filiere keywords → keep filiere
 *  3. Title match against any other filiere → reclassify to that filiere
 *  4. Description match against task's own filiere keywords → keep filiere
 *  5. No match → dump
 */
export function classifyFiliere(
  title: string,
  description: string,
  taskFiliere: string,
): string {
  const titleLower = title.toLowerCase()
  const descLower  = description.toLowerCase().slice(0, 800)

  // 1. Hard block
  if (BLOCKED_TITLE_KEYWORDS.some(kw => titleLower.includes(kw))) {
    return DUMP_FILIERE
  }

  // 2. Title matches task's own filiere
  const ownKeywords = FILIERE_TITLE_KEYWORDS[taskFiliere]
  if (ownKeywords?.some(kw => titleLower.includes(kw.toLowerCase()))) {
    return taskFiliere
  }

  // 3. Title matches a different filiere (reclassify)
  for (const [filiere, keywords] of Object.entries(FILIERE_TITLE_KEYWORDS)) {
    if (filiere === taskFiliere) continue
    if (keywords.some(kw => titleLower.includes(kw.toLowerCase()))) {
      return filiere
    }
  }

  // 4. Description matches task's own filiere (weaker signal, keep task filiere)
  if (ownKeywords?.some(kw => descLower.includes(kw.toLowerCase()))) {
    return taskFiliere
  }

  // 5. Dump
  return DUMP_FILIERE
}
