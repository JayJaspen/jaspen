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
    <div className="space-y-6 max-w-3xl">
      {albums.map((album) => (
        <PostCard key={album.id} album={album} basePath={basePath} />
      ))}
    </div>
  )
}

function PostCard({ album, basePath }: { album: Album; basePath: string }) {
  const formattedDate = (() => {
    try {
      return format(new Date(album.date + 'T12:00:00'), 'd MMMM yyyy', { locale: sv })
    } catch {
      return album.date
    }
  })()

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-jaspen-200 hover:shadow-md transition-all">
      {/* Cover image — click to open album */}
      <Link href={`${basePath}/${album.id}`} className="block relative group" style={{ aspectRatio: '16/9' }}>
        {album.cover_image_url ? (
          <Image
            src={album.cover_image_url}
            alt={album.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-jaspen-100 to-jaspen-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-jaspen-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
            Bläddra bland bilder
          </div>
        </div>

        {/* Photo count badge */}
        {album.image_count !== undefined && album.image_count > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/55 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
            {album.image_count} bilder
          </div>
        )}
      </Link>

      {/* Text info */}
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-gray-800 leading-snug">{album.title}</h2>
          <span className="text-sm text-gray-400 whitespace-nowrap mt-1">{formattedDate}</span>
        </div>
        {album.description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{album.description}</p>
        )}
      </div>
    </div>
  )
}
