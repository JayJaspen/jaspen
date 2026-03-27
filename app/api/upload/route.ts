import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
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
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'album-images'

    if (!file) {
      return NextResponse.json({ error: 'Ingen fil' }, { status: 400 })
    }

    // Kontrollera filtyp
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Endast bilder tillåts' }, { status: 400 })
    }

    // Max 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Filen är för stor (max 10 MB)' }, { status: 400 })
    }

    const supabase = createServerClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
    const path = `${session.userId}/${filename}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Uppladdning misslyckades' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return NextResponse.json({ url: publicUrl, path })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
