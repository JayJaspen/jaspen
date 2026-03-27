'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import type { AlbumImage } from '@/types'

interface Props {
  images: AlbumImage[]
  albumId: string
  onImagesUpdated: () => void
}

export default function AlbumView({ images, albumId, onImagesUpdated }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [captionValue, setCaptionValue] = useState('')
  const [savingCaption, setSavingCaption] = useState(false)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const prevImage = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }, [lightboxIndex])

  const nextImage = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }, [lightboxIndex, images.length])

  async function saveCaption(imageId: string) {
    setSavingCaption(true)
    try {
      await fetch(`/api/albums/${albumId}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: captionValue }),
      })
      setEditingCaption(null)
      onImagesUpdated()
    } catch (err) {
      console.error(err)
    } finally {
      setSavingCaption(false)
    }
  }

  async function deleteImage(imageId: string) {
    if (!confirm('Radera denna bild?')) return
    try {
      await fetch(`/api/albums/${albumId}/images/${imageId}`, { method: 'DELETE' })
      onImagesUpdated()
      if (lightboxIndex !== null) {
        closeLightbox()
      }
    } catch (err) {
      console.error(err)
    }
  }

  function downloadImage(url: string, filename?: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'bild.jpg'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <p className="text-sm">Inga bilder ännu. Ladda upp bilder ovan!</p>
      </div>
    )
  }

  return (
    <>
      {/* Photo grid */}
      <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="break-inside-avoid group relative bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-100"
          >
            <button
              onClick={() => openLightbox(index)}
              className="block w-full"
            >
              <Image
                src={img.image_url}
                alt={img.caption || `Bild ${index + 1}`}
                width={400}
                height={300}
                className="w-full object-cover group-hover:opacity-90 transition-opacity"
                style={{ height: 'auto' }}
              />
            </button>

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => downloadImage(img.image_url, `jaspen-${index + 1}.jpg`)}
                className="bg-white/90 hover:bg-white p-1.5 rounded-lg shadow text-gray-700 transition-colors"
                title="Spara bild"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              <button
                onClick={() => deleteImage(img.id)}
                className="bg-white/90 hover:bg-red-50 p-1.5 rounded-lg shadow text-red-500 transition-colors"
                title="Radera bild"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>

            {/* Caption */}
            <div className="p-2">
              {editingCaption === img.id ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={captionValue}
                    onChange={(e) => setCaptionValue(e.target.value)}
                    className="flex-1 text-xs border border-jaspen-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-jaspen-400"
                    placeholder="Bildtext..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCaption(img.id)
                      if (e.key === 'Escape') setEditingCaption(null)
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => saveCaption(img.id)}
                    disabled={savingCaption}
                    className="text-xs bg-jaspen-500 text-white px-2 py-1 rounded-lg hover:bg-jaspen-600 transition-colors"
                  >
                    {savingCaption ? '...' : '✓'}
                  </button>
                  <button
                    onClick={() => setEditingCaption(null)}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingCaption(img.id)
                    setCaptionValue(img.caption || '')
                  }}
                  className="text-xs text-gray-500 hover:text-jaspen-600 transition-colors text-left w-full min-h-[20px]"
                >
                  {img.caption || (
                    <span className="italic text-gray-300">+ Lägg till bildtext</span>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors z-10"
            onClick={closeLightbox}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); prevImage() }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Next */}
          {lightboxIndex < images.length - 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); nextImage() }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].image_url}
              alt={images[lightboxIndex].caption || `Bild ${lightboxIndex + 1}`}
              width={1200}
              height={900}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
              style={{ width: 'auto', height: 'auto' }}
            />
            {/* Caption + download */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-white/70 text-sm">
                {images[lightboxIndex].caption || ''}
              </p>
              <button
                onClick={() => downloadImage(images[lightboxIndex].image_url, `jaspen-${lightboxIndex + 1}.jpg`)}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Spara
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
