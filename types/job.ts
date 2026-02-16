export interface Job {
  id: string
  title: string
  company: string
  description: string
  location: string
  filiere: string
  niveau: string
  region: string
  contractType: string
  url: string
  source: string
  isApproved: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface JobFilters {
  filiere?: string
  niveau?: string
  region?: string
  contractType?: string
  search?: string
}
