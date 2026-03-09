export interface TaskConfig {
  taskId: string
  school: string
  filiere: string
  keyword: string
  source: 'wttj'
}

export const APIFY_TASKS: TaskConfig[] = [
  // ESDAC — Design
  { taskId: 'klU0TMpb8vS2dPU8L', school: 'ESDAC', filiere: 'Design', keyword: 'UX designer', source: 'wttj' },
  { taskId: 'R9NVR8qCAMBtzUIWW', school: 'ESDAC', filiere: 'Design', keyword: 'direction artistique', source: 'wttj' },
  { taskId: 'Zg99lp8wK0JM1sLYh', school: 'ESDAC', filiere: 'Design', keyword: 'graphiste', source: 'wttj' },

  // EIDM — Mode & Luxe
  { taskId: 'eZLclmLQTK5ZAYvdm', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'retail luxe', source: 'wttj' },
  { taskId: 'iTNNz7hYnHKMamHdE', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'merchandising mode', source: 'wttj' },
  { taskId: 'oBXOGTet1UwFeBytt', school: 'EIDM', filiere: 'Mode & Luxe', keyword: 'acheteur mode', source: 'wttj' },

  // CMH — Hôtellerie & Luxe
  { taskId: 'BBTy8hsTKlUp2xogG', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'food & beverage hôtel', source: 'wttj' },
  { taskId: 'nbyjW6hHJXFhq7f2u', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'réceptionniste hôtel', source: 'wttj' },
  { taskId: 'pANwtQIRF68H6PBwJ', school: 'CMH', filiere: 'Hôtellerie & Luxe', keyword: 'revenue management hôtel', source: 'wttj' },

  // AMOS — Sport Management
  { taskId: 'Tf1PrdOMbFfg5KhvJ', school: 'AMOS', filiere: 'Sport Management', keyword: 'événementiel sportif', source: 'wttj' },
  { taskId: 'sZ5PkRbpvTdfsB0iK', school: 'AMOS', filiere: 'Sport Management', keyword: 'marketing sportif', source: 'wttj' },
  { taskId: 'u8Re3L18YUFwaK2iO', school: 'AMOS', filiere: 'Sport Management', keyword: 'coordinateur sportif', source: 'wttj' },
]
