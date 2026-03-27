-- ============================================================
-- JASPEN.SE - Supabase Setup
-- Kör detta script i Supabase SQL Editor
-- ============================================================

-- 1. ANVÄNDARE
-- ============================================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- 2. STARTSIDA INNEHÅLL
-- ============================================================
create table if not exists home_content (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  text_content text,
  updated_at timestamptz default now()
);

-- 3. ALBUM (Resor, Födelsedagar, Allmänt)
-- ============================================================
create table if not exists albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  description text,
  cover_image_url text,
  category text not null check (category in ('travel', 'birthday', 'general')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_albums_category on albums(category);
create index if not exists idx_albums_date on albums(date);

-- 4. ALBUMBILDER
-- ============================================================
create table if not exists album_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references albums(id) on delete cascade,
  image_url text not null,
  caption text,
  order_index integer default 0,
  uploaded_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_album_images_album_id on album_images(album_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Vi använder service_role key från Next.js, så vi behöver
-- inte RLS, men det är bra practice att ha det aktiverat
-- ============================================================
alter table users enable row level security;
alter table home_content enable row level security;
alter table albums enable row level security;
alter table album_images enable row level security;

-- Service role kringgår RLS automatiskt, så inga policies behövs
-- för att vår app ska fungera. Policies nedan är bara ett skyddsnät.

-- ============================================================
-- INITIAL USERS
-- Lösenord: Brandabacken13!
-- Hash genererad med bcrypt, saltRounds=12
-- OBS: Kör detta EFTER att du kört npm run dev en gång och
-- verifierat att bcrypt fungerar. Alternativt, kör skriptet
-- nedan via en lokal Node.js-session för att generera hashen.
-- ============================================================

-- För att lägga till användare, kör detta i SQL Editor:
-- (Ersätt HASH_HERE med riktiga bcrypt-hashar)

-- Snabbaste sättet: Öppna terminalen, kör:
--   node -e "const b=require('bcryptjs'); b.hash('Brandabacken13!',12).then(h=>console.log(h))"
-- Kopiera hashen och ersätt nedan:

/*
insert into users (email, password_hash) values
  ('john@jaspen.se',   '$2a$12$HASH_HERE'),
  ('sandra@jaspen.se', '$2a$12$HASH_HERE'),
  ('elsa@jaspen.se',   '$2a$12$HASH_HERE'),
  ('alicia@jaspen.se', '$2a$12$HASH_HERE');
*/

-- ELLER: Kör seed-skriptet nedan i din terminal:
-- node supabase/seed.js

-- ============================================================
-- STORAGE BUCKETS
-- Skapa dessa i Supabase Dashboard > Storage
-- ============================================================
-- 1. Bucket: "album-images" (Public: true)
-- 2. Bucket: "home-images" (Public: true)
