'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { Album, AlbumCategory } from '@/types'

interface Props {
  albums: Album[]
  category: AlbumCategory
  basePath: string
}

export default function AlbumGrid({ albums, category, basePath }: Props) {
  if (albums.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-jaspen-50 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-jaspen-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-1">Inga inlägg ännu</h3>
        <p className="text-gray-400 text-sm mb-6">Skapa ditt första inlägg!</p>
        <Link
          href={`${basePath}/ny`}
          className="inline-flex items-center gap-2 bg-jaspen-500 hover:bg-jaspen-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Skapa nytt inlägg
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} basePath={basePath} />
      ))}
    </div>
  )
}

function AlbumCard({ album, basePath }: { album: Album; basePath: string }) {
  const formattedDate = (() => {
    try {
      return format(new Date(album.date + 'T12:00:00'), 'd MMM yyyy', { locale: sv })
    } catch {
      return album.date
    }
  })()

  return (
    <Link href={`${basePath}/${album.id}`} className="group block">
      <div className="photo-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-jaspen-200">
        {/* Cover image */}
        <div className="relative aspect-[4/3] bg-gray-100">
          {album.cover_image_url ? (
            <Image
              src={album.cover_image_url}
              alt={album.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-jaspen-100 to-jaspen-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-jaspen-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
          {/* Image count badge */}
          {album.image_count !== undefined && album.image_count > 0 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {album.image_count} bilder
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1 group-hover:text-jaspen-700 transition-colors">
            {album.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
          {album.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {album.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
