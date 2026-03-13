import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local'), override: true })

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const USERS = [
  { email: 'ngimet@ace-education.com',    name: 'N. Gimet' },
  { email: 'igohourou@ace-education.com', name: 'I. Gohourou' },
  { email: 'maury@ace-education.com',     name: 'Maury' },
]

const PASSWORD = 'Ace2025!'

async function main() {
  const hashed = await bcrypt.hash(PASSWORD, 12)

  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (existing) {
      await prisma.user.update({ where: { email: u.email }, data: { role: 'ADMIN', password: hashed } })
      console.log(`✅ Updated: ${u.email} → role=ADMIN, password reset`)
    } else {
      await prisma.user.create({
        data: { email: u.email, name: u.name, password: hashed, role: 'ADMIN', emailVerified: new Date() },
      })
      console.log(`✅ Created: ${u.email}`)
    }
  }

  console.log(`\nPassword for all accounts: ${PASSWORD}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
