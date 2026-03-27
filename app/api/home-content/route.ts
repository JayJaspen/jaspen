import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { createServerClient } from '@/lib/supabase'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/types'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('home_content')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Kunde inte hämta innehåll' }, { status: 500 })
  }

  return NextResponse.json(data || { image_url: null, text_content: null })
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  try {
    const { image_url, text_content } = await request.json()
    const supabase = createServerClient()

    // Kontrollera om det redan finns ett innehåll
    const { data: existing } = await supabase
      .from('home_content')
      .select('id')
      .limit(1)
      .single()

    let result
    if (existing?.id) {
      result = await supabase
        .from('home_content')
        .update({ image_url, text_content, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('home_content')
        .insert({ image_url, text_content })
        .select()
        .single()
    }

    if (result.error) {
      return NextResponse.json({ error: 'Kunde inte spara' }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (err) {
    console.error('Home content error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
