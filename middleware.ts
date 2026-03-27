import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('jaspen-session')
  const isAuthPage = request.nextUrl.pathname === '/'
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard && !sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
