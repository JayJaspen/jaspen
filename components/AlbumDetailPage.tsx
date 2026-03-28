'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingCaption, setEditingCaption] = useState(false)
  const [captionValue, setCaptionValue] = useState('')
  const [savingCaption, setSavingCaption] = useState(false)

  const fetchAlbum = useCallback(async (autoOpen = false) => {
    try {
      const res = await fetch(`/api/albums/${albumId}`)
      if (!res.ok) { router.push(basePath); return }
      const data = await res.json()
      setAlbum(data)
      // Auto-open lightbox on first load
      if (autoOpen && data.images?.length > 0) {
        const coverIdx = data.images.findIndex((img: AlbumImage) => img.image_url === data.cover_image_url)
        setLightboxIndex(coverIdx >= 0 ? coverIdx : 0)
      }
    } catch {
      router.push(basePath)
    } finally {
      setLoading(false)
    }
  }, [albumId, basePath, router])

  useEffect(() => { fetchAlbum(true) }, [fetchAlbum])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null || !album) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setLightboxIndex(null); setEditingCaption(false) }
      if (e.key === 'ArrowRight' && !editingCaption) {
        setLightboxIndex(i => i !== null && i < album!.images.length - 1 ? i + 1 : i)
        setEditingCaption(false)
      }
      if (e.key === 'ArrowLeft' && !editingCaption) {
        setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i)
        setEditingCaption(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, album, editingCaption])

  // Reset caption edit when switching images
  useEffect(() => {
    setEditingCaption(false)
    if (album && lightboxIndex !== null) {
      setCaptionValue(album.images[lightboxIndex]?.caption || '')
    }
  }, [lightboxIndex, album])

  async function saveCaption() {
    if (!album || lightboxIndex === null) return
    setSavingCaption(true)
    const imageId = album.images[lightboxIndex].id
    try {
      await fetch(`/api/albums/${albumId}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: captionValue }),
      })
      setEditingCaption(false)
      fetchAlbum(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingCaption(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Är du säker på att du vill radera detta inlägg och alla bilder?')) return
    setDeleting(true)
    await fetch(`/api/albums/${albumId}`, { method: 'DELETE' })
    router.push(basePath)
  }

  function downloadImage(url: string, index: number) {
    const a = document.createElement('a')
    a.href = url
    a.download = `jaspen-${index + 1}.jpg`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
    try { return format(new Date(album.date + 'T12:00:00'), 'd MMMM yyyy', { locale: sv }) }
    catch { return album.date }
  })()

  // Find cover image index in images array (default to 0)
  const coverIndex = album.images.findIndex(img => img.image_url === album.cover_image_url)
  const startIndex = coverIndex >= 0 ? coverIndex : 0

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.push(basePath)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Tillbaka till {backLabel}
      </button>

      {/* Post card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">

        {/* Front image — click to open photo browser */}
        <button
          onClick={() => album.images.length > 0 && setLightboxIndex(startIndex)}
          className="block w-full relative group"
          style={{ aspectRatio: '16/9' }}
          disabled={album.images.length === 0}
        >
          {album.cover_image_url ? (
            <Image
              src={album.cover_image_url}
              alt={album.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-jaspen-100 to-jaspen-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-jaspen-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
              </svg>
            </div>
          )}

          {/* Hover overlay */}
          {album.images.length > 0 && (
            <>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                  Bläddra bland bilder
                </div>
              </div>
              {/* Image count badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/55 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                </svg>
                {album.images.length} bilder
              </div>
            </>
          )}
        </button>

        {/* Text info */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-800 leading-snug">{album.title}</h1>
            <span className="text-sm text-gray-400 whitespace-nowrap mt-1">{formattedDate}</span>
          </div>
          {album.description && (
            <p className="text-gray-600 text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
              {album.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
            {album.images.length > 0 && (
              <button
                onClick={() => setLightboxIndex(startIndex)}
                className="flex items-center gap-1.5 text-sm text-jaspen-600 hover:text-jaspen-700 font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                </svg>
                Visa alla {album.images.length} bilder
              </button>
            )}
            <div className="flex-1" />
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

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && album.images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors z-10"
            onClick={() => setLightboxIndex(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {album.images.length}
          </div>

          {/* Prev */}
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i! - 1) }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Next */}
          {lightboxIndex < album.images.length - 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i! + 1) }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={album.images[lightboxIndex].image_url}
              alt={album.images[lightboxIndex].caption || `Bild ${lightboxIndex + 1}`}
              width={1400}
              height={1050}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
              style={{ width: 'auto', height: 'auto' }}
            />
            {/* Caption + download */}
            <div className="flex items-center gap-3 mt-3" onClick={e => e.stopPropagation()}>
              {editingCaption ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={captionValue}
                    onChange={e => setCaptionValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveCaption(); if (e.key === 'Escape') setEditingCaption(false) }}
                    placeholder="Lägg till bildtext..."
                    className="flex-1 bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-white/50"
                  />
                  <button onClick={saveCaption} disabled={savingCaption} className="bg-jaspen-500 hover:bg-jaspen-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    {savingCaption ? '...' : 'Spara'}
                  </button>
                  <button onClick={() => setEditingCaption(false)} className="text-white/50 hover:text-white px-2 py-1.5 rounded-lg text-sm transition-colors">
                    Avbryt
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setCaptionValue(album.images[lightboxIndex].caption || ''); setEditingCaption(true) }}
                  className="flex-1 text-left text-sm text-white/70 hover:text-white transition-colors"
                >
                  {album.images[lightboxIndex].caption
                    ? album.images[lightboxIndex].caption
                    : <span className="italic text-white/30">+ Lägg till bildtext</span>
                  }
                </button>
              )}
              <button
                onClick={() => downloadImage(album.images[lightboxIndex].image_url, lightboxIndex)}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Spara
              </button>
            </div>
          </div>

          {/* Thumbnail strip */}
          {album.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw]">
              {album.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === lightboxIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={`Miniatyr ${i + 1}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
