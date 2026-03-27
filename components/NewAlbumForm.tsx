'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import type { AlbumCategory } from '@/types'

interface Props {
  category: AlbumCategory
  basePath: string
  title: string
}

export default function NewAlbumForm({ category, basePath, title }: Props) {
  const router = useRouter()
  const [albumTitle, setAlbumTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [pendingImages, setPendingImages] = useState<{ image_url: string; caption: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!albumTitle || !date) {
      setError('Titel och datum krävs')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      // 1. Skapa album
      const albumRes = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: albumTitle,
          date,
          description: description || null,
          cover_image_url: coverUrl || (pendingImages[0]?.image_url || null),
          category,
        }),
      })

      if (!albumRes.ok) {
        const err = await albumRes.json()
        throw new Error(err.error || 'Kunde inte skapa inlägg')
      }

      const album = await albumRes.json()

      // 2. Lägg till bilder om det finns
      if (pendingImages.length > 0) {
        const imagesRes = await fetch(`/api/albums/${album.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: pendingImages }),
        })
        if (!imagesRes.ok) {
          console.warn('Bilder kunde inte läggas till')
        }
      }

      router.push(`${basePath}/${album.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Serverfel')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Tillbaka till {title}
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nytt inlägg</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rubrik *</label>
            <input
              type="text"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              required
              placeholder="T.ex. Semestern i Italien"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jaspen-400 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Datum *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jaspen-400 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Beskrivning</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Berätta lite om händelsen..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jaspen-400 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Bilder {pendingImages.length > 0 && <span className="text-jaspen-600">({pendingImages.length} st klara)</span>}
          </h2>
          <ImageUpload
            bucket="album-images"
            onUploadComplete={(imgs) => {
              setPendingImages((prev) => [...prev, ...imgs])
              if (!coverUrl && imgs.length > 0) {
                setCoverUrl(imgs[0].image_url)
              }
            }}
          />
          {pendingImages.length > 0 && (
            <p className="mt-3 text-sm text-green-600">
              ✓ {pendingImages.length} bild{pendingImages.length !== 1 ? 'er' : ''} redo att sparas
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-jaspen-500 hover:bg-jaspen-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sparar...
            </span>
          ) : (
            'Skapa inlägg'
          )}
        </button>
      </form>
    </div>
  )
}
