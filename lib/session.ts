import { SessionOptions } from 'iron-session'
import { SessionData } from '@/types'

export type { SessionData }

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'jaspen-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 dagar
  },
}
