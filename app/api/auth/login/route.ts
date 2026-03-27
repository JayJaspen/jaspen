import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/types'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-post och lösenord krävs' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Hämta användaren
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Fel e-postadress eller lösenord' },
        { status: 401 }
      )
    }

    // Verifiera lösenord
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Fel e-postadress eller lösenord' },
        { status: 401 }
      )
    }

    // Skapa session
    const cookieStore = await cookies()
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
    session.userId = user.id
    session.email = user.email
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ success: true, email: user.email })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Serverfel. Försök igen.' },
      { status: 500 }
    )
  }
}
