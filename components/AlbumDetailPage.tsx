'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import AlbumView from './AlbumView'
import ImageUpload from './ImageUpload'
import type { Album, AlbumImage } from '@/types'

interface AlbumWithImages extends Album {
  images: AlbumImage[]
}

interface Props {
  albumId: string
  basePath: string
  backLabel: string
}

export default function AlbumDetailPage({ albumId, basePath, backLabel }: Props) {
  const router = useRouter()
  const [album, setAlbum] = useState<AlbumWithImages | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchAlbum = useCallback(async () => {
    try {
      const res = await fetch(`/api/albums/${albumId}`)
      if (!res.ok) {
        router.push(basePath)
        return
      }
      const data = await res.json()
      setAlbum(data)
    } catch {
      router.push(basePath)
    } finally {
      setLoading(false)
    }
  }, [albumId, basePath, router])

  useEffect(() => {
    fetchAlbum()
  }, [fetchAlbum])

  async function handleUploadComplete(images: { image_url: string; caption: string }[]) {
    const res = await fetch(`/api/albums/${albumId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    })
    if (res.ok) {
      setShowUpload(false)
      fetchAlbum()
    }
  }

  async function handleDelete() {
    if (!confirm('Är du säker på att du vill radera detta inlägg och alla bilder?')) return
    setDeleting(true)
    await fetch(`/api/albums/${albumId}`, { method: 'DELETE' })
    router.push(basePath)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-jaspen-500 border-t-transparent" />
      </div>
    )
  }

  if (!album) return null

  const formattedDate = (() => {
    try {
      return format(new Date(album.date + 'T12:00:00'), 'd MMMM yyyy', { locale: sv })
    } catch {
      return album.date
    }
  })()

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push(basePath)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Tillbaka till {backLabel}
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
        {album.cover_image_url && (
          <div className="relative w-full h-64 sm:h-80">
            <Image
              src={album.cover_image_url}
              alt={album.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">{album.title}</h1>
              <p className="text-white/80 text-sm mt-1">{formattedDate}</p>
            </div>
          </div>
        )}
        <div className="p-6">
          {!album.cover_image_url && (
            <>
              <h1 className="text-2xl font-bold text-gray-800">{album.title}</h1>
              <p className="text-gray-400 text-sm mt-1">{formattedDate}</p>
            </>
          )}
          {album.description && (
            <p className="text-gray-600 text-sm leading-relaxed mt-3" style={{ whiteSpace: 'pre-wrap' }}>
              {album.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {album.images.length} bild{album.images.length !== 1 ? 'er' : ''}
            </span>
            <div className="flex-1" />
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-1.5 text-sm text-jaspen-600 hover:text-jaspen-700 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {showUpload ? 'Dölj uppladdning' : 'Ladda upp bilder'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Radera inlägg
            </button>
          </div>
        </div>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-jaspen-100 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Ladda upp fler bilder</h2>
          <ImageUpload
            bucket="album-images"
            onUploadComplete={handleUploadComplete}
            maxFiles={50 - album.images.length}
          />
        </div>
      )}

      {/* Photo gallery */}
      <AlbumView
        images={album.images}
        albumId={albumId}
        onImagesUpdated={fetchAlbum}
      />
    </div>
  )
}
