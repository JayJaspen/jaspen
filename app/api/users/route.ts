import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { createServerClient } from '@/lib/supabase'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/types'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, created_at')
    .order('email')

  if (error) {
    return NextResponse.json({ error: 'Kunde inte hämta användare' }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
