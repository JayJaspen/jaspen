import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/types'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 })
  }

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
  })
}
