export interface User {
  id: string
  email: string
  created_at: string
}

export interface SessionData {
  userId: string
  email: string
  isLoggedIn: boolean
}

export interface HomeContent {
  id: string
  image_url: string | null
  text_content: string | null
  updated_at: string
}

export type AlbumCategory = 'travel' | 'birthday' | 'general'

export interface Album {
  id: string
  title: string
  date: string
  description: string | null
  cover_image_url: string | null
  category: AlbumCategory
  created_by: string
  created_at: string
  creator?: User
  image_count?: number
}

export interface AlbumImage {
  id: string
  album_id: string
  image_url: string
  caption: string | null
  order_index: number
  uploaded_by: string
  created_at: string
}
