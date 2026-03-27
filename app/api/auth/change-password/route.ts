import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/types'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  try {
    const { targetEmail, newPassword } = await request.json()

    if (!targetEmail || !newPassword) {
      return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Lösenordet måste vara minst 6 tecken' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Kontrollera att målanvändaren finns
    const { data: targetUser, error: findError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', targetEmail.toLowerCase())
      .single()

    if (findError || !targetUser) {
      return NextResponse.json({ error: 'Användaren hittades inte' }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', targetUser.id)

    if (updateError) {
      return NextResponse.json({ error: 'Kunde inte uppdatera lösenordet' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Change password error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
