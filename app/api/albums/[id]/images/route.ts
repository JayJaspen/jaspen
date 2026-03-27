import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { createServerClient } from '@/lib/supabase'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/types'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: albumId } = await params
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
  }

  try {
    const { images } = await request.json()
    // images: Array<{ image_url: string, caption?: string, order_index: number }>

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Inga bilder angivna' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Hämta nuvarande högsta order_index
    const { data: existing } = await supabase
      .from('album_images')
      .select('order_index')
      .eq('album_id', albumId)
      .order('order_index', { ascending: false })
      .limit(1)

    const baseIndex = (existing?.[0]?.order_index ?? -1) + 1

    const insertData = images.map((img: { image_url: string; caption?: string }, i: number) => ({
      album_id: albumId,
      image_url: img.image_url,
      caption: img.caption || null,
      order_index: baseIndex + i,
      uploaded_by: session.userId,
    }))

    const { data, error } = await supabase
      .from('album_images')
      .insert(insertData)
      .select()

    if (error) {
      return NextResponse.json({ error: 'Kunde inte lägga till bilder' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Add images error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
