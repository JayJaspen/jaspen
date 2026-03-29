'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { Album, AlbumImage, AlbumCategory } from '@/types'

interface AlbumWithImages extends Album {
  images: AlbumImage[]
}

interface Props {
  category: AlbumCategory
  title: string
  basePath: string
}

export default function AlbumSection({ category, title, basePath }: Props) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAlbum, setActiveAlbum] = useState<AlbumWithImages | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [fetchingAlbum, setFetchingAlbum] = useState(false)
  const [editingCaption, setEditingCaption] = useState(false)
  const [captionValue, setCaptionValue] = useState('')
  const [savingCaption, setSavingCaption] = useState(false)

  useEffect(() => {
    fetch(`/api/albums?category=${category}`)
      .then(r => r.json())
      .then(data => { setAlbums(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category])

  async function openAlbum(albumId: string) {
    setFetchingAlbum(true)
    try {
      const res = await fetch(`/api/albums/${albumId}`)
      const data: AlbumWithImages = await res.json()
      setActiveAlbum(data)
      if (data.images?.length > 0) {
        const coverIdx = data.images.findIndex(img => img.image_url === data.cover_image_url)
        setLightboxIndex(coverIdx >= 0 ? coverIdx : 0)
      }
    } finally {
      setFetchingAlbum(false)
    }
  }

  function closeLightbox() {
    setActiveAlbum(null)
    setLightboxIndex(null)
    setEditingCaption(false)
  }

  const refetchActive = useCallback(async () => {
    if (!activeAlbum) return
    const res = await fetch(`/api/albums/${activeAlbum.id}`)
    const data: AlbumWithImages = await res.json()
    setActiveAlbum(data)
  }, [activeAlbum])

  // Keyboard nav
  useEffect(() => {
    if (lightboxIndex === null || !activeAlbum) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeLightbox(); return }
      if (editingCaption) return
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null && i < activeAlbum!.images.length - 1 ? i + 1 : i)
      if (e.key === 'ArrowLeft')  setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, activeAlbum, editingCaption])

  // Reset caption when switching images
  useEffect(() => {
    setEditingCaption(false)
    if (activeAlbum && lightboxIndex !== null) {
      setCaptionValue(activeAlbum.images[lightboxIndex]?.caption || '')
    }
  }, [lightboxIndex, activeAlbum])

  async function saveCaption() {
    if (!activeAlbum || lightboxIndex === null) return
    setSavingCaption(true)
    const imageId = activeAlbum.images[lightboxIndex].id
    try {
      await fetch(`/api/albums/${activeAlbum.id}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: captionValue }),
      })
      setEditingCaption(false)
      refetchActive()
    } finally {
      setSavingCaption(false)
    }
  }

  function downloadImage(url: string, index: number) {
    const a = document.createElement('a')
    a.href = url; a.download = `jaspen-${index + 1}.jpg`; a.target = '_blank'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

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

      {/* Loading spinner or fetching overlay */}
      {fetchingAlbum && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent" />
        </div>
      )}

      {/* Album grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-jaspen-500 border-t-transparent" />
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-jaspen-50 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-jaspen-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">Inga inlägg ännu</h3>
          <p className="text-gray-400 text-sm mb-6">Skapa ditt första inlägg!</p>
          <Link href={`${basePath}/ny`} className="inline-flex items-center gap-2 bg-jaspen-500 hover:bg-jaspen-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Skapa nytt inlägg
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map(album => (
            <AlbumCard key={album.id} album={album} onOpen={() => openAlbum(album.id)} />
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && activeAlbum?.images[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={closeLightbox}>

          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
            <div className="text-white/50 text-sm">{lightboxIndex + 1} / {activeAlbum.images.length}</div>
            <button className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors" onClick={closeLightbox}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center relative px-14 min-h-0">
            {lightboxIndex > 0 && (
              <button className="absolute left-2 text-white/70 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-colors z-10"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! - 1) }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            <Image
              src={activeAlbum.images[lightboxIndex].image_url}
              alt={activeAlbum.images[lightboxIndex].caption || `Bild ${lightboxIndex + 1}`}
              width={1400} height={1050}
              className="max-h-full max-w-full object-contain rounded-lg"
              style={{ width: 'auto', height: 'auto' }}
              onClick={e => e.stopPropagation()}
            />
            {lightboxIndex < activeAlbum.images.length - 1 && (
              <button className="absolute right-2 text-white/70 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-colors z-10"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! + 1) }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Caption */}
          <div className="shrink-0 px-6 py-2" onClick={e => e.stopPropagation()}>
            {editingCaption ? (
              <div className="flex items-center gap-2 max-w-xl mx-auto">
                <input autoFocus type="text" value={captionValue}
                  onChange={e => setCaptionValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveCaption(); if (e.key === 'Escape') setEditingCaption(false) }}
                  placeholder="Lägg till bildtext..."
                  className="flex-1 bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-lg px-3 py-1.5 text-sm italic text-center focus:outline-none focus:border-white/50"
                />
                <button onClick={saveCaption} disabled={savingCaption} className="bg-jaspen-500 hover:bg-jaspen-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0">
                  {savingCaption ? '...' : 'Spara'}
                </button>
                <button onClick={() => setEditingCaption(false)} className="text-white/40 hover:text-white px-2 py-1.5 rounded-lg text-sm shrink-0">✕</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => { setCaptionValue(activeAlbum.images[lightboxIndex].caption || ''); setEditingCaption(true) }}
                  className="text-sm italic text-white/65 hover:text-white/90 transition-colors text-center tracking-wide"
                >
                  {activeAlbum.images[lightboxIndex].caption
                    ? activeAlbum.images[lightboxIndex].caption
                    : <span className="text-white/25 not-italic text-xs">+ Lägg till bildtext</span>
                  }
                </button>
                <button onClick={() => downloadImage(activeAlbum.images[lightboxIndex].image_url, lightboxIndex)}
                  className="flex items-center gap-1 text-white/35 hover:text-white/70 text-xs hover:bg-white/10 px-2 py-1 rounded-lg transition-colors shrink-0" title="Spara bild">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {activeAlbum.images.length > 1 && (
            <div className="shrink-0 flex gap-2 px-4 pb-4 overflow-x-auto justify-center" onClick={e => e.stopPropagation()}>
              {activeAlbum.images.map((img, i) => (
                <button key={img.id} onClick={() => setLightboxIndex(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'}`}>
                  <Image src={img.image_url} alt={`Miniatyr ${i + 1}`} width={48} height={48} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AlbumCard({ album, onOpen }: { album: Album; onOpen: () => void }) {
  const formattedDate = (() => {
    try { return format(new Date(album.date + 'T12:00:00'), 'd MMMM yyyy', { locale: sv }) }
    catch { return album.date }
  })()

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-jaspen-200 hover:shadow-md transition-all">
      <button onClick={onOpen} className="block w-full relative group" style={{ aspectRatio: '16/9' }}>
        {album.cover_image_url ? (
          <Image src={album.cover_image_url} alt={album.title} fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-jaspen-100 to-jaspen-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-jaspen-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
            Bläddra bland bilder
          </div>
        </div>
        {album.image_count !== undefined && album.image_count > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/55 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
            {album.image_count} bilder
          </div>
        )}
      </button>
      <div className="px-4 py-4">
        <h2 className="text-sm font-bold text-gray-800 leading-snug line-clamp-1 mb-0.5">{album.title}</h2>
        <p className="text-xs text-gray-400 mb-1">{formattedDate}</p>
        {album.description && <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{album.description}</p>}
      </div>
    </div>
  )
}
