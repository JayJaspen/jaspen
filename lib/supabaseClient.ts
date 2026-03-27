'use client'

import { createClient } from '@supabase/supabase-js'

// Browser-side client med anon key (för direkta Storage-URL:er etc.)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
