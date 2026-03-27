/**
 * Jaspen.se - Seed-skript
 * Skapar de 4 startanvändarna i Supabase
 *
 * Användning:
 *   1. Installera beroenden: npm install
 *   2. Kopiera .env.local.example till .env.local och fyll i dina Supabase-nycklar
 *   3. Kör: node supabase/seed.js
 */

const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Läs .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const [key, ...vals] = line.split('=')
    if (key && vals.length > 0) {
      process.env[key.trim()] = vals.join('=').trim()
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Fel: Saknar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const DEFAULT_PASSWORD = 'Brandabacken13!'

const users = [
  { email: 'john@jaspen.se' },
  { email: 'sandra@jaspen.se' },
  { email: 'elsa@jaspen.se' },
  { email: 'alicia@jaspen.se' },
]

async function seed() {
  console.log('Skapar användare med lösenord:', DEFAULT_PASSWORD)
  console.log('Genererar bcrypt-hashar (kan ta några sekunder)...\n')

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12)
  console.log('Hash:', hash)
  console.log()

  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert({ email: user.email, password_hash: hash }, { onConflict: 'email' })

    if (error) {
      console.error(`Fel för ${user.email}:`, error.message)
    } else {
      console.log(`✓ ${user.email}`)
    }
  }

  console.log('\nKlart! Alla användare har skapats.')
  console.log('Lösenord:', DEFAULT_PASSWORD)
  console.log('Logga in på din webbplats och byt lösenord via Min sida.')
}

seed().catch(console.error)
