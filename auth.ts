import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { authConfig } from "./auth.config"
import { lookupStudentByEmail, isAdminEmail } from "@/lib/hubspot/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET ? [
      MicrosoftEntraID({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        issuer: process.env.AZURE_AD_TENANT_ID
          ? `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`
          : "https://login.microsoftonline.com/common/v2.0",
      }),
    ] : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email
      if (!email) return true

      // Admin emails (env list) or DB admins skip HubSpot check
      if (isAdminEmail(email)) return true
      const dbRole = await prisma.user.findUnique({ where: { email }, select: { role: true } })
      if (dbRole?.role === 'ADMIN') return true

      // Testing mode: bypass HubSpot whitelist entirely
      if (process.env.DISABLE_HUBSPOT_WHITELIST === 'true') {
        console.log('[auth] HubSpot whitelist disabled — allowing sign-in for:', email)
        return true
      }

      try {
        const whitelist = await prisma.studentWhitelist.findUnique({ where: { email } })

        if (whitelist) {
          const lastChecked = whitelist.verifiedAt
          const hoursSince = (Date.now() - lastChecked.getTime()) / 3_600_000

          // Still fresh (< 24h) — allow
          if (hoursSince < 24) return true

          // Stale — re-check HubSpot
          try {
            const hsData = await lookupStudentByEmail(email)
            if (hsData) {
              await prisma.studentWhitelist.update({
                where: { email },
                data: {
                  verifiedAt: new Date(),
                  expiresAt:  new Date(Date.now() + 86_400_000),
                  school:     hsData.school ?? undefined,
                },
              })
              return true
            }
            // Not found in HubSpot anymore — still allow (graceful)
            console.warn(`[signIn] ${email} no longer found in HubSpot, allowing with stale whitelist`)
            return true
          } catch (hubspotErr) {
            // HubSpot error — log and allow (graceful degradation)
            console.warn(`[signIn] HubSpot re-check failed for ${email}:`, hubspotErr)
            return true
          }
        }

        // Not in whitelist — check HubSpot
        try {
          const hsData = await lookupStudentByEmail(email)
          if (hsData) {
            await prisma.studentWhitelist.upsert({
              where: { email },
              create: {
                email,
                school:           hsData.school ?? undefined,
                hubspotContactId: hsData.contactId,
                expiresAt:        new Date(Date.now() + 86_400_000),
              },
              update: {
                school:     hsData.school ?? undefined,
                verifiedAt: new Date(),
                expiresAt:  new Date(Date.now() + 86_400_000),
              },
            })
            return true
          }
          // Not found in HubSpot and not in whitelist
          console.warn(`[signIn] ${email} not found in HubSpot whitelist`)
          return false
        } catch (hubspotErr) {
          // HubSpot error — log and allow (graceful degradation)
          console.warn(`[signIn] HubSpot lookup failed for ${email}:`, hubspotErr)
          return true
        }
      } catch (dbErr) {
        console.error(`[signIn] DB error for ${email}:`, dbErr)
        return true
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        // Fetch role from DB to handle both Credentials and OAuth sign-ins
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { role: true },
        })
        token.role = dbUser?.role ?? 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  events: {
    async signIn({ user, account }) {
      // Auto-verify email for OAuth users
      if (account?.type === "oauth" && user.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { emailVerified: new Date() },
        })
      }
    },
  },
})
