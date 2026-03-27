import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { createServerClient } from '@/lib/supabase'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/types'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { imageId } = await params
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  try {
    const { caption } = await request.json()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('album_images')
      .update({ caption: caption || null })
      .eq('id', imageId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Kunde inte uppdatera bildtext' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Update image caption error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { imageId } = await params
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { error } = await supabase.from('album_images').delete().eq('id', imageId)

  if (error) {
    return NextResponse.json({ error: 'Kunde inte radera bild' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
