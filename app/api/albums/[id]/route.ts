import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { createServerClient } from '@/lib/supabase'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select(`*, creator:users!created_by(id, email)`)
    .eq('id', id)
    .single()

  if (albumError || !album) {
    return NextResponse.json({ error: 'Album hittades inte' }, { status: 404 })
  }

  const { data: images, error: imagesError } = await supabase
    .from('album_images')
    .select('*')
    .eq('album_id', id)
    .order('order_index', { ascending: true })

  if (imagesError) {
    return NextResponse.json({ error: 'Kunde inte hämta bilder' }, { status: 500 })
  }

  return NextResponse.json({ ...album, images: images || [] })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  try {
    const { title, date, description, cover_image_url } = await request.json()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('albums')
      .update({ title, date, description, cover_image_url })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Kunde inte uppdatera album' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Update album error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { error } = await supabase.from('albums').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Kunde inte radera album' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
