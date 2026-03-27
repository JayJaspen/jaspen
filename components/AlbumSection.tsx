'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AlbumGrid from './AlbumGrid'
import type { Album, AlbumCategory } from '@/types'

interface Props {
  category: AlbumCategory
  title: string
  basePath: string
}

export default function AlbumSection({ category, title, basePath }: Props) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/albums?category=${category}`)
      .then((r) => r.json())
      .then((data) => {
        setAlbums(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <Link
          href={`${basePath}/ny`}
          className="flex items-center gap-2 bg-jaspen-500 hover:bg-jaspen-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nytt inlägg
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-jaspen-500 border-t-transparent" />
        </div>
      ) : (
        <AlbumGrid albums={albums} category={category} basePath={basePath} />
      )}
    </div>
  )
}
