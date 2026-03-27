import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { createServerClient } from '@/lib/supabase'
import { sessionOptions } from '@/lib/session'
import type { SessionData, AlbumCategory } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as AlbumCategory | null

  const supabase = createServerClient()
  let query = supabase
    .from('albums')
    .select(`
      *,
      creator:users!created_by(id, email),
      image_count:album_images(count)
    `)
    .order('date', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Kunde inte hämta album' }, { status: 500 })
  }

  // Normalisera image_count
  const albums = (data || []).map((album) => ({
    ...album,
    image_count: Array.isArray(album.image_count)
      ? album.image_count[0]?.count || 0
      : 0,
  }))

  return NextResponse.json(albums)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  try {
    const { title, date, description, cover_image_url, category } = await request.json()

    if (!title || !date || !category) {
      return NextResponse.json({ error: 'Titel, datum och kategori krävs' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('albums')
      .insert({
        title,
        date,
        description: description || null,
        cover_image_url: cover_image_url || null,
        category,
        created_by: session.userId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Kunde inte skapa album' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Create album error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
