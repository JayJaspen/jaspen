'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface HomeContent {
  image_url: string | null
  text_content: string | null
}

export default function StartsidaPage() {
  const [content, setContent] = useState<HomeContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/home-content')
      .then((r) => r.json())
      .then((data) => {
        setContent(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-jaspen-500 border-t-transparent" />
      </div>
    )
  }

  const hasContent = content?.image_url || content?.text_content

  if (!hasContent) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-jaspen-50 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-jaspen-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Välkommen till Jaspen!</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Startsidan är tom. Gå till <strong>Min sida</strong> för att lägga till en bild och text som visas här.
        </p>
        <a
          href="/dashboard/minsida"
          className="inline-flex items-center gap-2 bg-jaspen-500 hover:bg-jaspen-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Anpassa startsidan
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero image */}
      {content?.image_url && (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl mb-8" style={{ height: '480px' }}>
          <Image
            src={content.image_url}
            alt="Startsida bild"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}

      {/* Text content */}
      {content?.text_content && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div
            className="prose prose-gray max-w-none text-gray-700 leading-relaxed text-lg"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {content.text_content}
          </div>
        </div>
      )}
    </div>
  )
}
