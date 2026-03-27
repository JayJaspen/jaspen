# Jaspen.se

Familjens gemensamma webbplats — med inloggning, fotoalbum och delat innehåll.

## Teknisk stack

- **Next.js 14** (App Router) — React-ramverk
- **Supabase** — Databas (PostgreSQL) + bildlagring
- **iron-session** — Sessionshantering
- **Tailwind CSS** — Stilar
- **Vercel** — Hosting

---

## Steg-för-steg: Sätt upp projektet

### 1. Skapa ett Supabase-projekt

1. Gå till [supabase.com](https://supabase.com) och skapa ett konto
2. Klicka **New project**
3. Välj ett namn (t.ex. "jaspen"), lösenord och region (Europe West)
4. Vänta tills projektet startar (~2 minuter)

### 2. Skapa databasen

1. Gå till **SQL Editor** i Supabase
2. Öppna filen `supabase/setup.sql` i detta projekt
3. Kopiera innehållet och klistra in i SQL Editor
4. Klicka **Run**

### 3. Skapa Storage-buckets

1. Gå till **Storage** i Supabase
2. Klicka **New bucket**, namnge den `album-images`, sätt **Public** till ON
3. Skapa ytterligare en bucket: `home-images`, sätt **Public** till ON

### 4. Hämta dina API-nycklar

1. Gå till **Settings → API** i Supabase
2. Kopiera:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Konfigurera lokalt

```bash
# Klona/ladda ner projektet
cd jaspen-website

# Installera beroenden
npm install

# Skapa .env.local från mall
cp .env.local.example .env.local
```

Öppna `.env.local` och fyll i dina nycklar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SESSION_SECRET=skriv-minst-32-slumpmässiga-tecken-här
```

> **SESSION_SECRET**: Generera ett säkert lösenord med:
> `openssl rand -base64 32`

### 6. Skapa användarna (seed)

```bash
node supabase/seed.js
```

Detta skapar följande användare med lösenordet **Brandabacken13!**:
- john@jaspen.se
- sandra@jaspen.se
- elsa@jaspen.se
- alicia@jaspen.se

### 7. Testa lokalt

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) och logga in!

---

## Publicera på Vercel via GitHub

### Steg 1: Lägg upp på GitHub

```bash
# Initiera git (om inte redan gjort)
git init
git add .
git commit -m "Initial commit"

# Skapa ett nytt GitHub-repo på github.com
# Koppla och pusha
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/jaspen-website.git
git push -u origin main
```

> ⚠️ `.env.local` är med i `.gitignore` — dina nycklar läggs ALDRIG upp på GitHub!

### Steg 2: Koppla till Vercel

1. Gå till [vercel.com](https://vercel.com) och logga in
2. Klicka **New Project**
3. Välj ditt GitHub-repo `jaspen-website`
4. Klicka **Import**

### Steg 3: Lägg till miljövariabler i Vercel

Under **Environment Variables**, lägg till:

| Namn | Värde |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Din Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Din anon nyckel |
| `SUPABASE_SERVICE_ROLE_KEY` | Din service role nyckel |
| `SESSION_SECRET` | Ditt hemliga lösenord (32+ tecken) |

### Steg 4: Deploya!

Klicka **Deploy**. Vercel bygger projektet automatiskt.

### Steg 5: Koppla jaspen.se-domänen

1. I Vercel, gå till **Settings → Domains**
2. Lägg till `jaspen.se` och `www.jaspen.se`
3. Följ Vercels instruktioner för att uppdatera DNS-inställningarna hos din domänleverantör

---

## Användning

### Logga in
Gå till jaspen.se och logga in med din e-post och det gemensamma startlösenordet.

### Byta lösenord
Gå till **Min sida** → **Byt lösenord**. Du kan byta lösenord för alla användare.

### Lägga till resor/events
1. Gå till önskad flik (Resor & äventyr, Födelsedagar & fest, eller Allmänt)
2. Klicka **Nytt inlägg**
3. Fyll i rubrik, datum och beskrivning
4. Ladda upp bilder (upp till 50 st)
5. Klicka **Skapa inlägg**

### Lägga till fler bilder i efterhand
Öppna ett inlägg och klicka **Ladda upp bilder**.

### Lägga till/ändra bildtexter
Klicka på texten under valfri bild i albumvyn för att redigera.

### Spara bilder lokalt
Hovra över en bild → klicka på nedladdningspilen, eller öppna bilden i lightbox och klicka **Spara**.

---

## Uppdateringar

Varje gång du pushar till GitHub deployar Vercel automatiskt den nya versionen.

```bash
git add .
git commit -m "Uppdatering"
git push
```
