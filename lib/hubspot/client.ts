const HUBSPOT_BASE = 'https://api.hubapi.com'

// The HubSpot lead status value that identifies active students
const STUDENT_LEAD_STATUS = "En Recherche d'Alternance"

// Properties to fetch from HubSpot — maps to User model fields
const FETCH_PROPERTIES = [
  'firstname',
  'lastname',
  'email',
  'phone',
  'mobilephone',
  'brands',        // → school
  'jobtitle',      // → specialization
  'hs_lead_status',
].join(',')

export interface HubSpotStudent {
  contactId: string
  school?: string       // from brands (optional)
  firstName?: string
  lastName?: string
  phone?: string
  specialization?: string
}

export async function lookupStudentByEmail(email: string): Promise<HubSpotStudent | null> {
  const token = process.env.HUBSPOT_API_TOKEN
  if (!token) throw new Error('HUBSPOT_API_TOKEN is not set')

  const url = `${HUBSPOT_BASE}/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email&properties=${FETCH_PROPERTIES}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HubSpot API error ${res.status}: ${body}`)
  }

  const data = await res.json() as {
    id: string
    properties: {
      firstname?: string
      lastname?: string
      phone?: string
      mobilephone?: string
      brands?: string
      jobtitle?: string
      hs_lead_status?: string
    }
  }

  const leadStatus = data.properties?.hs_lead_status?.trim()
  if (leadStatus !== STUDENT_LEAD_STATUS) return null

  return {
    contactId:     data.id,
    school:        data.properties.brands?.trim() || undefined,
    firstName:     data.properties.firstname?.trim() || undefined,
    lastName:      data.properties.lastname?.trim() || undefined,
    phone:         (data.properties.phone || data.properties.mobilephone)?.trim() || undefined,
    specialization: data.properties.jobtitle?.trim() || undefined,
  }
}

export function isAdminEmail(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}
