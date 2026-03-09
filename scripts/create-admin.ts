import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer) }))
}

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npm run create-admin -- email@ace-education.fr')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } })
    console.log(`✅ ${email} is now ADMIN (role updated)`)
  } else {
    const password = await prompt('No account found. Enter a password for the new admin: ')
    if (password.length < 8) {
      console.error('Password must be at least 8 characters.')
      process.exit(1)
    }
    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: 'Admin',
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    })
    console.log(`✅ Admin account created for ${email}`)
  }

  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
