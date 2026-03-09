import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const jobs = [
  // ── Sport Management (6) ──────────────────────────────────
  {
    title: "Assistant Marketing Sportif",
    company: "Paris Saint-Germain",
    description:
      "Rejoignez le département marketing du PSG pour contribuer à la stratégie de marque du club. Vous participerez à la création de contenus digitaux, à l'organisation d'événements fans et à l'analyse des performances des campagnes sur les réseaux sociaux.\n\nVous travaillerez en étroite collaboration avec les équipes communication et partenariats pour développer l'image du club à l'international.",
    location: "Paris 16ème",
    filiere: "Sport Management",
    niveau: "Bac+4",
    region: "Paris",
    contractType: "Alternance",
    url: "https://careers.psg.fr/marketing-sportif",
    source: "seed",
  },
  {
    title: "Chargé de Projet Événementiel Sportif",
    company: "Decathlon",
    description:
      "Organisez et coordonnez des événements sportifs locaux et nationaux pour Decathlon. Gestion logistique, relations avec les partenaires sportifs et communication événementielle pour promouvoir le sport accessible à tous.\n\nVous serez responsable du suivi budgétaire et de la coordination des prestataires pour chaque événement.",
    location: "Lille",
    filiere: "Sport Management",
    niveau: "Bac+3",
    region: "Lille",
    contractType: "Stage",
    url: "https://recrutement.decathlon.fr/evenementiel",
    source: "seed",
  },
  {
    title: "Business Developer - Esport",
    company: "Vitality",
    description:
      "Intégrez l'équipe commerciale de Team Vitality pour développer les partenariats B2B dans l'univers esport. Prospection de sponsors, négociation de contrats et suivi des activations partenaires lors des compétitions.\n\nVous contribuerez au développement commercial d'une des plus grandes structures esport européennes.",
    location: "Paris 2ème",
    filiere: "Sport Management",
    niveau: "Bac+5",
    region: "Paris",
    contractType: "Alternance",
    url: "https://vitality.gg/careers/business-dev",
    source: "seed",
  },
  {
    title: "Assistant Chef de Projet Sponsoring",
    company: "Fédération Française de Football",
    description:
      "Au sein de la direction marketing de la FFF, vous assisterez le chef de projet dans la gestion des partenariats officiels. Coordination des activations sponsors lors des matchs de l'Équipe de France, suivi des contrats et reporting des retombées médiatiques.\n\nUne opportunité unique de travailler au cœur du football français.",
    location: "Paris 15ème",
    filiere: "Sport Management",
    niveau: "Bac+4",
    region: "Paris",
    contractType: "Alternance",
    url: "https://fff.fr/recrutement/sponsoring",
    source: "seed",
  },
  {
    title: "Community Manager Sport",
    company: "beIN Sports",
    description:
      "Gérez les communautés digitales de beIN Sports France sur les réseaux sociaux. Création de contenus engageants autour de l'actualité sportive, animation des communautés et analyse des KPIs social media.\n\nVous couvrirez les grands événements sportifs : Ligue 1, Champions League, Roland Garros et bien plus.",
    location: "Nanterre",
    filiere: "Sport Management",
    niveau: "Bac+3",
    region: "Paris",
    contractType: "Stage",
    url: "https://beinsports.com/careers/community-manager",
    source: "seed",
  },
  {
    title: "Analyste Data Sport",
    company: "Olympique Lyonnais",
    description:
      "Rejoignez le pôle analytique de l'OL pour exploiter les données sportives et business. Création de tableaux de bord de performance, analyse statistique des matchs et optimisation de l'expérience spectateur au Groupama Stadium.\n\nVous utiliserez Python, SQL et des outils de data visualisation pour produire des insights actionnables.",
    location: "Lyon 7ème",
    filiere: "Sport Management",
    niveau: "Bac+5",
    region: "Lyon",
    contractType: "Alternance",
    url: "https://ol.fr/recrutement/data-analyst",
    source: "seed",
  },

  // ── Hôtellerie & Luxe (6) ────────────────────────────────
  {
    title: "Assistant Manager Hôtelier",
    company: "Four Seasons Hotel George V",
    description:
      "Découvrez la gestion hôtelière de luxe en assistant le directeur d'un palace parisien. Accueil des clients VIP, coordination des équipes de service, gestion des réservations et optimisation de l'expérience client.\n\nVous évoluerez dans un environnement d'excellence au cœur du Triangle d'Or.",
    location: "Paris 8ème",
    filiere: "Hôtellerie & Luxe",
    niveau: "Bac+4",
    region: "Paris",
    contractType: "Alternance",
    url: "https://fourseasons.com/paris/careers/assistant-manager",
    source: "seed",
  },
  {
    title: "Chargé de Réservation Luxe",
    company: "Accor - Raffles",
    description:
      "Intégrez l'équipe réservation de la marque Raffles d'Accor. Vous serez en charge de la gestion des réservations individuelles et groupes, du suivi client personnalisé et de l'optimisation du yield management.\n\nUne immersion dans l'univers du luxe hôtelier international.",
    location: "Paris 12ème",
    filiere: "Hôtellerie & Luxe",
    niveau: "Bac+3",
    region: "Paris",
    contractType: "Stage",
    url: "https://accor.com/careers/raffles-reservation",
    source: "seed",
  },
  {
    title: "Coordinateur Événements - Palace",
    company: "Hôtel Martinez",
    description:
      "Coordonnez les événements prestigieux de l'Hôtel Martinez à Cannes : galas, soirées privées, événements corporate et activations durant le Festival de Cannes. Gestion logistique, relation fournisseurs et suivi budgétaire.\n\nUn poste idéal pour développer votre réseau dans l'événementiel de luxe.",
    location: "Cannes",
    filiere: "Hôtellerie & Luxe",
    niveau: "Bac+4",
    region: "Nice",
    contractType: "Alternance",
    url: "https://martinez-cannes.com/careers/events",
    source: "seed",
  },
  {
    title: "Assistant Revenue Manager",
    company: "Marriott International",
    description:
      "Participez à l'optimisation des revenus d'un portfolio d'hôtels Marriott en France. Analyse tarifaire, stratégie de distribution, suivi des performances et recommandations pricing.\n\nVous utiliserez des outils analytiques avancés pour maximiser le RevPAR des établissements.",
    location: "Lyon 2ème",
    filiere: "Hôtellerie & Luxe",
    niveau: "Bac+5",
    region: "Lyon",
    contractType: "Alternance",
    url: "https://marriott.com/careers/revenue-manager-lyon",
    source: "seed",
  },
  {
    title: "Chargé de Clientèle - Tourisme de Luxe",
    company: "Club Med",
    description:
      "Accompagnez la clientèle premium de Club Med dans la création de voyages sur mesure. Conseil personnalisé, élaboration de packages exclusifs et suivi de la satisfaction client pour les destinations 5 Tridents.\n\nVous développerez une expertise unique dans le tourisme haut de gamme.",
    location: "Lyon 6ème",
    filiere: "Hôtellerie & Luxe",
    niveau: "Bac+3",
    region: "Lyon",
    contractType: "Stage",
    url: "https://clubmed.com/careers/clientele-luxe",
    source: "seed",
  },
  {
    title: "Assistant Spa Manager",
    company: "Le Royal Évian Resort",
    description:
      "Assistez la direction du spa du Royal Évian dans la gestion quotidienne d'un espace bien-être de 1 500m². Coordination des praticiens, gestion des plannings, suivi qualité et développement de l'offre soins.\n\nUne expérience dans un cadre exceptionnel face au Lac Léman.",
    location: "Évian-les-Bains",
    filiere: "Hôtellerie & Luxe",
    niveau: "Bac+3",
    region: "Chambéry",
    contractType: "Apprentissage",
    url: "https://royal-evian.com/careers/spa-manager",
    source: "seed",
  },

  // ── Mode & Luxe (6) ──────────────────────────────────────
  {
    title: "Assistant Chef de Produit Mode",
    company: "LVMH - Louis Vuitton",
    description:
      "Assistez le chef de produit dans le développement des collections maroquinerie. Suivi de production, analyse des tendances du marché, coordination avec les ateliers et participation aux revues de collection.\n\nVous serez au cœur de la création d'une des maisons les plus emblématiques du luxe mondial.",
    location: "Paris 1er",
    filiere: "Mode & Luxe",
    niveau: "Bac+5",
    region: "Paris",
    contractType: "Alternance",
    url: "https://lvmh.com/careers/chef-produit-lv",
    source: "seed",
  },
  {
    title: "Visual Merchandiser",
    company: "Chanel",
    description:
      "Contribuez à la mise en scène des collections Chanel en boutique. Conception des vitrines, agencement des espaces de vente et respect de l'identité visuelle de la maison pour les points de vente de la région.\n\nVous travaillerez en lien avec la direction artistique pour garantir l'excellence visuelle.",
    location: "Paris 8ème",
    filiere: "Mode & Luxe",
    niveau: "Bac+4",
    region: "Paris",
    contractType: "Alternance",
    url: "https://chanel.com/careers/visual-merchandiser",
    source: "seed",
  },
  {
    title: "Assistant Acheteur Mode",
    company: "Galeries Lafayette",
    description:
      "Intégrez l'équipe achats mode femme des Galeries Lafayette. Veille concurrentielle, analyse des ventes, sélection des marques et négociation commerciale pour constituer une offre mode attractive et rentable.\n\nUne expérience formatrice dans le retail haut de gamme.",
    location: "Paris 9ème",
    filiere: "Mode & Luxe",
    niveau: "Bac+4",
    region: "Paris",
    contractType: "Stage",
    url: "https://galerieslafayette.com/careers/acheteur",
    source: "seed",
  },
  {
    title: "Chargé de Communication Luxe",
    company: "Kering - Gucci",
    description:
      "Participez aux stratégies de communication de Gucci France. Relations presse, organisation d'événements exclusifs, gestion des partenariats célébrités et production de contenus pour les réseaux sociaux de la marque.\n\nVous évoluerez dans un environnement créatif et international.",
    location: "Paris 7ème",
    filiere: "Mode & Luxe",
    niveau: "Bac+5",
    region: "Paris",
    contractType: "Alternance",
    url: "https://kering.com/careers/communication-gucci",
    source: "seed",
  },
  {
    title: "Assistant E-commerce Luxe",
    company: "Hermès",
    description:
      "Rejoignez l'équipe e-commerce d'Hermès pour accompagner le développement du canal digital. Gestion du catalogue en ligne, suivi des performances, coordination avec les équipes logistiques et animation commerciale du site.\n\nUne immersion dans la transformation digitale d'une maison iconique.",
    location: "Bordeaux",
    filiere: "Mode & Luxe",
    niveau: "Bac+3",
    region: "Bordeaux",
    contractType: "Alternance",
    url: "https://hermes.com/careers/ecommerce",
    source: "seed",
  },
  {
    title: "Coordinateur Production Textile",
    company: "Zadig & Voltaire",
    description:
      "Coordonnez la production des collections Zadig & Voltaire avec les fournisseurs. Suivi des délais, contrôle qualité, gestion des approvisionnements et optimisation de la chaîne de production.\n\nVous serez l'interface entre le bureau de style et les ateliers de fabrication.",
    location: "Paris 3ème",
    filiere: "Mode & Luxe",
    niveau: "Bac+3",
    region: "Paris",
    contractType: "Stage",
    url: "https://zadig-et-voltaire.com/careers/production",
    source: "seed",
  },

  // ── Design (6) ────────────────────────────────────────────
  {
    title: "UX/UI Designer Junior",
    company: "Ubisoft",
    description:
      "Créez des interfaces utilisateur innovantes pour les jeux et applications Ubisoft. Réalisation de wireframes, prototypes interactifs et maquettes haute fidélité en collaboration avec les développeurs et game designers.\n\nVous utiliserez Figma et contribuerez à l'expérience de millions de joueurs.",
    location: "Bordeaux",
    filiere: "Design",
    niveau: "Bac+3",
    region: "Bordeaux",
    contractType: "Alternance",
    url: "https://ubisoft.com/careers/ux-designer-bordeaux",
    source: "seed",
  },
  {
    title: "Designer Graphique",
    company: "Publicis Sapient",
    description:
      "Rejoignez le studio créatif de Publicis Sapient pour concevoir des identités visuelles et supports de communication pour des clients grands comptes. Direction artistique, création print et digitale, motion design.\n\nVous travaillerez sur des projets variés pour des marques internationales.",
    location: "Paris 17ème",
    filiere: "Design",
    niveau: "Bac+4",
    region: "Paris",
    contractType: "Alternance",
    url: "https://publicissapient.com/careers/designer-graphique",
    source: "seed",
  },
  {
    title: "Product Designer",
    company: "BlaBlaCar",
    description:
      "Participez à la conception de l'application BlaBlaCar utilisée par des millions de personnes. Research utilisateur, design d'interfaces, prototypage et tests d'utilisabilité pour améliorer l'expérience de covoiturage.\n\nVous intégrerez une équipe produit agile dans un environnement tech innovant.",
    location: "Paris 9ème",
    filiere: "Design",
    niveau: "Bac+5",
    region: "Paris",
    contractType: "Alternance",
    url: "https://blablacar.com/careers/product-designer",
    source: "seed",
  },
  {
    title: "Designer d'Intérieur",
    company: "Maison Sarah Lavoine",
    description:
      "Assistez l'équipe de design intérieur dans la conception d'espaces résidentiels et commerciaux. Réalisation de plans, sélection de matériaux, création de planches d'ambiance et suivi de chantier.\n\nVous développerez votre œil artistique au sein d'une maison de design reconnue.",
    location: "Paris 6ème",
    filiere: "Design",
    niveau: "Bac+3",
    region: "Paris",
    contractType: "Stage",
    url: "https://sarahlavoine.com/careers/designer-interieur",
    source: "seed",
  },
  {
    title: "UI Designer - Application Mobile",
    company: "Doctolib",
    description:
      "Concevez les interfaces de l'application Doctolib pour améliorer l'accès aux soins. Création de composants design system, maquettes d'écrans et animations pour une expérience patient fluide et accessible.\n\nVous contribuerez à un produit qui impacte positivement la santé de millions de Français.",
    location: "Nantes",
    filiere: "Design",
    niveau: "Bac+4",
    region: "Nantes",
    contractType: "Alternance",
    url: "https://doctolib.com/careers/ui-designer-nantes",
    source: "seed",
  },
  {
    title: "Designer Packaging",
    company: "L'Oréal",
    description:
      "Participez à la création des packagings pour les marques du groupe L'Oréal. Recherche de formes, choix des matériaux, suivi technique avec les fournisseurs et respect des contraintes réglementaires.\n\nVous allierez créativité et rigueur technique pour des produits distribués dans le monde entier.",
    location: "Clichy",
    filiere: "Design",
    niveau: "Bac+5",
    region: "Paris",
    contractType: "Contrat de professionnalisation",
    url: "https://loreal.com/careers/designer-packaging",
    source: "seed",
  },

  // ── Illustration & Animation (6) ──────────────────────────
  {
    title: "Animateur 2D",
    company: "Ankama",
    description:
      "Rejoignez le studio Ankama pour travailler sur des séries animées et des jeux vidéo. Animation 2D de personnages, création de cycles de marche, animation d'effets spéciaux et intégration dans le pipeline de production.\n\nVous participerez à des projets créatifs comme Wakfu et Dofus.",
    location: "Roubaix",
    filiere: "Illustration & Animation",
    niveau: "Bac+3",
    region: "Lille",
    contractType: "Alternance",
    url: "https://ankama.com/careers/animateur-2d",
    source: "seed",
  },
  {
    title: "Illustrateur - Édition Jeunesse",
    company: "Gallimard Jeunesse",
    description:
      "Collaborez avec l'équipe éditoriale de Gallimard Jeunesse pour créer des illustrations de livres pour enfants. Développement de personnages, création de planches couleur et adaptation au style éditorial de la collection.\n\nVous donnerez vie à des histoires qui marqueront l'imaginaire des jeunes lecteurs.",
    location: "Paris 7ème",
    filiere: "Illustration & Animation",
    niveau: "Bac+3",
    region: "Paris",
    contractType: "Stage",
    url: "https://gallimard-jeunesse.fr/careers/illustrateur",
    source: "seed",
  },
  {
    title: "Motion Designer",
    company: "Canal+",
    description:
      "Créez des habillages TV, génériques et animations graphiques pour les chaînes du groupe Canal+. Motion design, compositing, création de templates et adaptation aux différents formats de diffusion.\n\nVous travaillerez avec After Effects, Cinema 4D et les outils du pipeline broadcast.",
    location: "Issy-les-Moulineaux",
    filiere: "Illustration & Animation",
    niveau: "Bac+4",
    region: "Paris",
    contractType: "Alternance",
    url: "https://canalplus.com/careers/motion-designer",
    source: "seed",
  },
  {
    title: "Artiste 3D - Jeux Vidéo",
    company: "Don't Nod",
    description:
      "Intégrez le studio Don't Nod (Life is Strange) comme artiste 3D. Modélisation d'environnements, texturing, éclairage et intégration dans Unreal Engine pour des jeux narratifs primés.\n\nVous contribuerez à la création d'univers immersifs et émotionnellement riches.",
    location: "Paris 20ème",
    filiere: "Illustration & Animation",
    niveau: "Bac+5",
    region: "Paris",
    contractType: "Alternance",
    url: "https://dontnod.com/careers/artiste-3d",
    source: "seed",
  },
  {
    title: "Concept Artist",
    company: "Fortiche Production",
    description:
      "Rejoignez Fortiche Production, le studio derrière Arcane (League of Legends), pour créer des concept arts de personnages et décors. Recherche visuelle, character design, environnement design et exploration stylistique.\n\nUne opportunité rare dans un studio d'animation de renommée mondiale.",
    location: "Paris 10ème",
    filiere: "Illustration & Animation",
    niveau: "Bac+4",
    region: "Paris",
    contractType: "Stage",
    url: "https://fortiche.prod/careers/concept-artist",
    source: "seed",
  },
  {
    title: "Graphiste BD / Comics",
    company: "Delcourt",
    description:
      "Participez à la production de bandes dessinées pour les Éditions Delcourt. Encrage, colorisation numérique, lettering et mise en page pour des albums de BD franco-belge et des comics.\n\nVous travaillerez aux côtés d'auteurs reconnus dans l'industrie de la BD.",
    location: "Toulouse",
    filiere: "Illustration & Animation",
    niveau: "Bac+3",
    region: "Toulouse",
    contractType: "Apprentissage",
    url: "https://editionsdelcourt.fr/careers/graphiste-bd",
    source: "seed",
  },
]

async function main() {
  console.log("Seeding database...")

  // Seed jobs
  await prisma.job.deleteMany({ where: { source: "seed" } })
  for (const job of jobs) {
    await prisma.job.create({ data: job })
  }
  console.log(`Seeded ${jobs.length} jobs successfully!`)

  // Seed test users
  console.log("Creating test users...")

  // Delete existing test users
  await prisma.user.deleteMany({
    where: { email: { in: ["test@ace-education.fr", "oauth@ace-education.fr"] } },
  })

  // User 1: Email/password account
  const hashedPassword = await bcrypt.hash("TestPassword123!", 12)
  const testUser1 = await prisma.user.create({
    data: {
      email: "test@ace-education.fr",
      name: "Alice Martin",
      password: hashedPassword,
      emailVerified: new Date(),
      school: "AMOS",
      educationLevel: "Bac+4",
      graduationYear: 2026,
      specialization: "Marketing Sportif",
      phone: "0612345678",
      linkedIn: "https://linkedin.com/in/alice-martin",
    },
  })

  // User 2: Simulated OAuth account
  const testUser2 = await prisma.user.create({
    data: {
      email: "oauth@ace-education.fr",
      name: "Bob Dupont",
      emailVerified: new Date(),
      school: "EIDM",
      educationLevel: "Bac+5",
      graduationYear: 2025,
      specialization: "Création Mode",
    },
  })

  console.log(`Created test users: ${testUser1.email}, ${testUser2.email}`)

  // Get some job IDs for saved jobs
  const allJobs = await prisma.job.findMany({ take: 10, select: { id: true } })

  if (allJobs.length >= 5) {
    // Save 5 jobs for test user 1
    for (const job of allJobs.slice(0, 5)) {
      await prisma.savedJob.upsert({
        where: { userId_jobId: { userId: testUser1.id, jobId: job.id } },
        create: { userId: testUser1.id, jobId: job.id },
        update: {},
      })
    }

    // Save 5 different jobs for test user 2
    for (const job of allJobs.slice(5, 10)) {
      await prisma.savedJob.upsert({
        where: { userId_jobId: { userId: testUser2.id, jobId: job.id } },
        create: { userId: testUser2.id, jobId: job.id },
        update: {},
      })
    }

    console.log("Saved 5 jobs per test user!")
  }

  console.log("\n✅ Seed completed!")
  console.log("\n📧 Test accounts:")
  console.log("  Email:    test@ace-education.fr")
  console.log("  Password: TestPassword123!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
