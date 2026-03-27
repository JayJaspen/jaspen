'use client'

import { useState, useRef } from 'react'

interface UploadedFile {
  url: string
  caption: string
  previewUrl: string
  file: File
}

interface Props {
  bucket?: string
  onUploadComplete: (images: { image_url: string; caption: string }[]) => void
  maxFiles?: number
}

export default function ImageUpload({ bucket = 'album-images', onUploadComplete, maxFiles = 50 }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return

    const total = files.length + selected.length
    if (total > maxFiles) {
      setError(`Max ${maxFiles} bilder tillåts`)
      return
    }

    setError('')
    const newFiles: UploadedFile[] = selected.map((file) => ({
      url: '',
      caption: '',
      previewUrl: URL.createObjectURL(file),
      file,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].previewUrl)
      updated.splice(index, 1)
      return updated
    })
  }

  function updateCaption(index: number, caption: string) {
    setFiles((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], caption }
      return updated
    })
  }

  async function handleUpload() {
    if (files.length === 0) return
    setUploading(true)
    setProgress(0)
    setError('')

    const uploaded: { image_url: string; caption: string }[] = []

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i]
      const formData = new FormData()
      formData.append('file', fileData.file)
      formData.append('bucket', bucket)

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Uppladdning misslyckades')
        }

        const { url } = await res.json()
        uploaded.push({ image_url: url, caption: fileData.caption })
      } catch (err) {
        setError(`Fel vid uppladdning av bild ${i + 1}: ${err instanceof Error ? err.message : 'Okänt fel'}`)
        setUploading(false)
        return
      }

      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    // Clean up preview URLs
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl))
    setFiles([])
    setUploading(false)
    setProgress(0)
    onUploadComplete(uploaded)
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-jaspen-300 rounded-2xl p-8 text-center cursor-pointer hover:border-jaspen-400 hover:bg-jaspen-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 text-jaspen-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm font-medium text-gray-700">Klicka för att ladda upp bilder</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 10 MB per bild, upp till {maxFiles} bilder</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            {files.length} bild{files.length !== 1 ? 'er' : ''} vald{files.length !== 1 ? 'a' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((f, i) => (
              <div key={i} className="relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.previewUrl}
                  alt={`Preview ${i + 1}`}
                  className="w-full aspect-square object-cover"
                />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow"
                >
                  ✕
                </button>
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Bildtext (valfritt)"
                    value={f.caption}
                    onChange={(e) => updateCaption(i, e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-jaspen-400 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-jaspen-500 hover:bg-jaspen-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium text-sm transition-colors shadow"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Laddar upp... {progress}%
              </span>
            ) : (
              `Ladda upp ${files.length} bild${files.length !== 1 ? 'er' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  )
}
