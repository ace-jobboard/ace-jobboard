import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

const email = process.argv[2]

if (!email) {
  console.error('Usage: npx tsx scripts/test-hubspot.ts <email>')
  process.exit(1)
}

async function main() {
  const token = process.env.HUBSPOT_API_TOKEN
  console.log(`Looking up: ${email}`)
  console.log(`Token: ${token?.slice(0, 20)}...`)

  const props = 'firstname,lastname,phone,mobilephone,brands,jobtitle,hs_lead_status'
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email&properties=${props}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status === 404) {
    console.log('✗ Not found in HubSpot')
    return
  }

  if (!res.ok) {
    console.log(`✗ HubSpot API error ${res.status}:`, await res.text())
    return
  }

  const data = await res.json() as { id: string; properties: Record<string, string> }
  console.log('\nRaw properties:')
  console.log(`  hs_lead_status: ${JSON.stringify(data.properties.hs_lead_status)}`)
  console.log(`  brands:         ${JSON.stringify(data.properties.brands)}`)
  console.log(`  firstname:      ${JSON.stringify(data.properties.firstname)}`)
  console.log(`  lastname:       ${JSON.stringify(data.properties.lastname)}`)
  console.log(`  phone:          ${JSON.stringify(data.properties.phone)}`)
  console.log(`  mobilephone:    ${JSON.stringify(data.properties.mobilephone)}`)
  console.log(`  jobtitle:       ${JSON.stringify(data.properties.jobtitle)}`)

  const isStudent = data.properties.hs_lead_status === "En Recherche d'Alternance"
  const hasSchool = !!data.properties.brands?.trim()

  console.log(`\n${isStudent && hasSchool ? '✓ Would be ALLOWED to register' : '✗ Would be BLOCKED'}`)
  if (!isStudent) console.log(`  → lead status is not "En Recherche d'Alternance" (got: ${data.properties.hs_lead_status})`)
  if (!hasSchool) console.log(`  → brands property is empty`)
}

main().catch(console.error)
