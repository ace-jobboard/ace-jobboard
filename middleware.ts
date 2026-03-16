import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session?.user
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN'

  const isPublic =
    nextUrl.pathname === '/' ||
    nextUrl.pathname === '/jobboard' ||
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/register') ||
    nextUrl.pathname.startsWith('/forgot-password') ||
    nextUrl.pathname.startsWith('/reset-password') ||
    nextUrl.pathname.startsWith('/verify-email') ||
    nextUrl.pathname.startsWith('/api/auth') ||
    nextUrl.pathname.startsWith('/api/jobs')

  if (isPublic) return NextResponse.next()

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  if (nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.webp$).*)'],
}
