export interface TaskConfig {
  taskId: string
  school: string
  filiere: string
  keyword: string
  contractType: 'alternance' | 'stage' | 'both'
  source: 'wttj' | 'hellowork' | 'linkedin' | 'indeed' | 'jobteaser'
}

export const APIFY_TASKS: TaskConfig[] = [

  // ─── AMOS — Sport Management (WTTJ) ──────────────────────────────────────
  { taskId: 'pzARUwrCJptbhW5cI', school: 'AMOS', filiere: 'Sport Management', keyword: 'marketing sportif',    contractType: 'both', source: 'wttj' },
  { taskId: 'QnJ4hxoKbP7qT7cXI', school: 'AMOS', filiere: 'Sport Management', keyword: 'événementiel sportif', contractType: 'both', source: 'wttj' },
  { taskId: '4bSdtjB1jer9dmdNu', school: 'AMOS', filiere: 'Sport Management', keyword: 'communication sport',  contractType: 'both', source: 'wttj' },

  // ─── CMH — Hôtellerie & Luxe (WTTJ) ──────────────────────────────────────
  { taskId: 'xEey1MGLcDna1q3PC', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'réception hôtellerie',   contractType: 'both', source: 'wttj' },
  { taskId: 'jKEfnhz7N4InXdbfL', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'restauration management', contractType: 'both', source: 'wttj' },
  { taskId: 'o5fQQGdrsuWo3KpIL', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'marketing luxe',          contractType: 'both', source: 'wttj' },
  { taskId: 'vj96yuZd2n5f4YcBA', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'événementiel luxe',       contractType: 'both', source: 'wttj' },

  // ─── EIDM — Mode & Luxe (WTTJ) ───────────────────────────────────────────
  { taskId: 'N4P3UYu3cLcSv0KFq', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'stylisme mode',      contractType: 'both', source: 'wttj' },
  { taskId: 'arMnebiIhJeJLExkF', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'merchandising luxe', contractType: 'both', source: 'wttj' },
  { taskId: 'SzKFQV622gQ9EYW3Z', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'communication mode', contractType: 'both', source: 'wttj' },
  { taskId: 'NRYEpgCpacwup4C9L', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'retail luxe',        contractType: 'both', source: 'wttj' },

  // ─── ESDAC — Design (WTTJ) ───────────────────────────────────────────────
  { taskId: 'nouBRW3wD8ry7KD5K', school: 'ESDAC', filiere: 'Design', keyword: 'design graphique',    contractType: 'both', source: 'wttj' },
  { taskId: 'dbv9c9YbN5Ygxwnmx', school: 'ESDAC', filiere: 'Design', keyword: 'UX UI design',        contractType: 'both', source: 'wttj' },
  { taskId: 'A6pnmMgQwQOJsesxa', school: 'ESDAC', filiere: 'Design', keyword: 'motion design',       contractType: 'both', source: 'wttj' },
  { taskId: '7XmyvbIQEhs9HGdVX', school: 'ESDAC', filiere: 'Design', keyword: 'direction artistique', contractType: 'both', source: 'wttj' },

  // ─── ENAAI — Illustration & Animation (WTTJ) ─────────────────────────────
  { taskId: 'eS0TP6GOsEO7rAeF8', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'illustration',        contractType: 'both', source: 'wttj' },
  { taskId: 'J3wq5lVptOd0wLcvh', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'animation 2D 3D',      contractType: 'both', source: 'wttj' },
  { taskId: 'FXbylpGZVxMO9QpbA', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'jeux vidéo graphisme', contractType: 'both', source: 'wttj' },
  { taskId: 'x4wjDFTnMnA9FBKDb', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'concept art',          contractType: 'both', source: 'wttj' },

  // ─── AMOS — Sport Management (LinkedIn) ──────────────────────────────────
  { taskId: 'm5Zsiu8CIhdOCnPj9', school: 'AMOS', filiere: 'Sport Management', keyword: 'Marketing Sportif',    contractType: 'both', source: 'linkedin' },
  { taskId: '2xVaKA34FXtvhMGuF', school: 'AMOS', filiere: 'Sport Management', keyword: 'Événementiel Sportif', contractType: 'both', source: 'linkedin' },
  { taskId: '5jKTeMNV6eCesBVoi', school: 'AMOS', filiere: 'Sport Management', keyword: 'Communication Sport',  contractType: 'both', source: 'linkedin' },
  { taskId: '38erB674F7GM9mfwR', school: 'AMOS', filiere: 'Sport Management', keyword: 'Management Sportif',   contractType: 'both', source: 'linkedin' },
  { taskId: 'P64Il8nVLX4e5FnIw', school: 'AMOS', filiere: 'Sport Management', keyword: 'Sponsoring Sport',     contractType: 'both', source: 'linkedin' },

  // ─── CMH — Hôtellerie & Luxe (LinkedIn) ──────────────────────────────────
  { taskId: 'C9z96asgGDY5OWWEG', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Réception Hôtellerie',     contractType: 'both', source: 'linkedin' },
  { taskId: 'zqMmd3TJz7dm4bVc5', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Restauration Management',  contractType: 'both', source: 'linkedin' },
  { taskId: '0Nkq91r9NO5XyTK5V', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Marketing Luxe',           contractType: 'both', source: 'linkedin' },
  { taskId: 'kd0ernhTUKNEralcC', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Événementiel Luxe',        contractType: 'both', source: 'linkedin' },
  { taskId: 'hI5vigQEfDOdg4KDE', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Revenue Management Hôtel', contractType: 'both', source: 'linkedin' },

  // ─── EIDM — Mode & Luxe (LinkedIn) ───────────────────────────────────────
  { taskId: '0duvhOCzS0LJFRZjd', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Stylisme Mode',      contractType: 'both', source: 'linkedin' },
  { taskId: 'vMwqC3vh1qluJVAqw', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Merchandising Luxe', contractType: 'both', source: 'linkedin' },
  { taskId: 'wBGkGsxSMWnK4pPOn', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Communication Mode', contractType: 'both', source: 'linkedin' },
  { taskId: 'qY5hrp4Rw8TG92NOn', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Retail Luxe',        contractType: 'both', source: 'linkedin' },
  { taskId: 'd17dDultBcXpZdmou', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Acheteur Mode',      contractType: 'both', source: 'linkedin' },

  // ─── ESDAC — Design (LinkedIn) ───────────────────────────────────────────
  { taskId: 'd96Cg5nX4GUaOBOSM', school: 'ESDAC', filiere: 'Design', keyword: 'Design Graphique',    contractType: 'both', source: 'linkedin' },
  { taskId: '7z7tgj4LG7PVnVMeT', school: 'ESDAC', filiere: 'Design', keyword: 'UX UI Design',        contractType: 'both', source: 'linkedin' },
  { taskId: 'Mlp3w2DpLhNZQ360O', school: 'ESDAC', filiere: 'Design', keyword: 'Motion Design',       contractType: 'both', source: 'linkedin' },
  { taskId: 'YOOJQYwrsUXaTbj7M', school: 'ESDAC', filiere: 'Design', keyword: 'Direction Artistique', contractType: 'both', source: 'linkedin' },
  { taskId: 'o3H0DVi0vJaAgmzyf', school: 'ESDAC', filiere: 'Design', keyword: 'Graphiste',           contractType: 'both', source: 'linkedin' },

  // ─── ENAAI — Illustration & Animation (LinkedIn) ─────────────────────────
  { taskId: 'xeGe2UhTwHKjd32I8', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Illustration',        contractType: 'both', source: 'linkedin' },
  { taskId: '8SXRRD59cyjzqAoHH', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Animation 2D 3D',      contractType: 'both', source: 'linkedin' },
  { taskId: 'MDlkroqoCuYn0RJw4', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Motion Designer',       contractType: 'both', source: 'linkedin' },
  { taskId: 'Qd0UkbBYwDoZv9hff', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Concept Art',           contractType: 'both', source: 'linkedin' },
  { taskId: 'a6g2L7ywazqV7uoaM', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Jeux Vidéo Graphisme',  contractType: 'both', source: 'linkedin' },

  // ─── AMOS — Sport Management (Indeed) ────────────────────────────────────
  { taskId: '', school: 'AMOS', filiere: 'Sport Management', keyword: 'Marketing Sportif',               contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'AMOS', filiere: 'Sport Management', keyword: 'Communication Sport',             contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'AMOS', filiere: 'Sport Management', keyword: 'Événementiel Sport',              contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'AMOS', filiere: 'Sport Management', keyword: 'Développement Commercial Sport',  contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'AMOS', filiere: 'Sport Management', keyword: 'Sponsoring Sport',                contractType: 'both', source: 'indeed' },

  // ─── CMH — Hôtellerie & Luxe (Indeed) ────────────────────────────────────
  { taskId: '', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Marketing Hôtellerie',       contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Communication Luxe',         contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Revenue Management',         contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Événementiel Luxe',          contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'Relations Clientèle Hôtel',  contractType: 'both', source: 'indeed' },

  // ─── EIDM — Mode & Luxe (Indeed) ─────────────────────────────────────────
  { taskId: '', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Marketing Mode',           contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Communication Mode Luxe',  contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Chef de Projet Mode',      contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Digital Marketing Luxe',   contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'Merchandising Mode',       contractType: 'both', source: 'indeed' },

  // ─── ESDAC — Design (Indeed) ──────────────────────────────────────────────
  { taskId: '', school: 'ESDAC', filiere: 'Design', keyword: 'Graphiste',            contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'ESDAC', filiere: 'Design', keyword: 'Designer Graphique',   contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'ESDAC', filiere: 'Design', keyword: 'Direction Artistique', contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'ESDAC', filiere: 'Design', keyword: 'UX Design',            contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'ESDAC', filiere: 'Design', keyword: 'Motion Design',        contractType: 'both', source: 'indeed' },

  // ─── ENAAI — Illustration & Animation (Indeed) ───────────────────────────
  { taskId: '', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Illustrateur',   contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Animateur 2D 3D', contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Concept Artist',  contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Character Design', contractType: 'both', source: 'indeed' },
  { taskId: '', school: 'ENAAI', filiere: 'Illustration & Animation', keyword: 'Motion Designer',  contractType: 'both', source: 'indeed' },
]
