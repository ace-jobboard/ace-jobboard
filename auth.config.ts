import type { NextAuthConfig } from "next-auth"

// Edge-compatible auth config (no Prisma, no bcrypt)
// Used by middleware to check session without hitting the database
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isAdmin = nextUrl.pathname.startsWith("/admin")
      const isAuthPage =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/register" ||
        nextUrl.pathname === "/verify-email" ||
        nextUrl.pathname.startsWith("/forgot-password") ||
        nextUrl.pathname.startsWith("/reset-password")

      if (isAdmin) {
        const role = (auth?.user as { role?: string })?.role
        if (!isLoggedIn || role !== "ADMIN") {
          return Response.redirect(new URL("/login", nextUrl))
        }
        return true
      }

      if ((isDashboard || nextUrl.pathname === "/") && !isLoggedIn) {
        return false // Redirects to signIn page
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl))
      }

      return true
    },
  },
  providers: [], // Providers are configured in auth.ts
} satisfies NextAuthConfig
