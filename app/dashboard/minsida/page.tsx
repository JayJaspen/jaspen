'use client'

import { useEffect, useState, FormEvent } from 'react'
import Image from 'next/image'

interface User {
  id: string
  email: string
}

interface HomeContent {
  image_url: string | null
  text_content: string | null
}

export default function MinSidaPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [homeContent, setHomeContent] = useState<HomeContent>({ image_url: null, text_content: null })

  // Home content form
  const [homeText, setHomeText] = useState('')
  const [homeImageUrl, setHomeImageUrl] = useState('')
  const [uploadingHomeImage, setUploadingHomeImage] = useState(false)
  const [savingHome, setSavingHome] = useState(false)
  const [homeSuccess, setHomeSuccess] = useState('')
  const [homeError, setHomeError] = useState('')

  // Password form
  const [selectedUserEmail, setSelectedUserEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.email) {
          setCurrentUser({ id: data.userId, email: data.email })
          setSelectedUserEmail(data.email)
        }
      })

    // Fetch all users
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))

    // Fetch home content
    fetch('/api/home-content')
      .then((r) => r.json())
      .then((data) => {
        setHomeContent(data)
        setHomeText(data.text_content || '')
        setHomeImageUrl(data.image_url || '')
      })
  }, [])

  async function handleHomeImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHomeImage(true)
    setHomeError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'home-images')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Uppladdning misslyckades')
      const { url } = await res.json()
      setHomeImageUrl(url)
    } catch (err) {
      setHomeError(err instanceof Error ? err.message : 'Fel')
    } finally {
      setUploadingHomeImage(false)
    }
  }

  async function handleSaveHome(e: FormEvent) {
    e.preventDefault()
    setSavingHome(true)
    setHomeSuccess('')
    setHomeError('')

    try {
      const res = await fetch('/api/home-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: homeImageUrl || null, text_content: homeText || null }),
      })
      if (!res.ok) throw new Error('Kunde inte spara')
      setHomeSuccess('Startsidan har uppdaterats!')
      setTimeout(() => setHomeSuccess(''), 3000)
    } catch (err) {
      setHomeError(err instanceof Error ? err.message : 'Fel')
    } finally {
      setSavingHome(false)
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordSuccess('')
    setPasswordError('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Lösenorden matchar inte')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Lösenordet måste vara minst 6 tecken')
      return
    }

    setSavingPassword(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: selectedUserEmail, newPassword }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Fel')
      }
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(`Lösenordet för ${selectedUserEmail} har uppdaterats!`)
      setTimeout(() => setPasswordSuccess(''), 4000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Fel')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Min sida</h1>

      {/* ===== STARTSIDA INSTÄLLNINGAR ===== */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Anpassa startsidan</h2>
        <p className="text-sm text-gray-500 mb-5">
          Bilden och texten som visas på startsidan för alla användare.
        </p>

        <form onSubmit={handleSaveHome} className="space-y-5">
          {/* Current image preview */}
          {homeImageUrl && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
              <Image src={homeImageUrl} alt="Startsidabild" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setHomeImageUrl('')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {homeImageUrl ? 'Byt bild' : 'Välj bild'}
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="flex-1 border border-dashed border-jaspen-300 rounded-xl px-4 py-3 text-center hover:border-jaspen-400 hover:bg-jaspen-50 transition-colors">
                {uploadingHomeImage ? (
                  <span className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-jaspen-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Laddar upp...
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">
                    Klicka för att välja bild
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleHomeImageUpload}
                className="hidden"
                disabled={uploadingHomeImage}
              />
            </label>
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Text på startsidan</label>
            <textarea
              value={homeText}
              onChange={(e) => setHomeText(e.target.value)}
              placeholder="Skriv ett välkomstmeddelande eller info om familjen..."
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-jaspen-400 focus:border-transparent resize-none"
            />
          </div>

          {homeSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              ✓ {homeSuccess}
            </div>
          )}
          {homeError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {homeError}
            </div>
          )}

          <button
            type="submit"
            disabled={savingHome || uploadingHomeImage}
            className="w-full bg-jaspen-500 hover:bg-jaspen-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow"
          >
            {savingHome ? 'Sparar...' : 'Spara startsidan'}
          </button>
        </form>
      </section>

      {/* ===== LÖSENORD ===== */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Byt lösenord</h2>
        <p className="text-sm text-gray-500 mb-5">
          Du kan byta lösenord för alla användare.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* User selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Välj användare</label>
            <select
              value={selectedUserEmail}
              onChange={(e) => setSelectedUserEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jaspen-400 focus:border-transparent bg-white"
            >
              {users.map((u) => (
                <option key={u.id} value={u.email}>
                  {u.email} {u.email === currentUser?.email ? '(du)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nytt lösenord</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minst 6 tecken"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jaspen-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bekräfta lösenord</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Upprepa lösenordet"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jaspen-400 focus:border-transparent"
            />
          </div>

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
              ✓ {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {passwordError}
            </div>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full bg-jaspen-500 hover:bg-jaspen-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow"
          >
            {savingPassword ? 'Sparar...' : 'Uppdatera lösenord'}
          </button>
        </form>
      </section>

      {/* Info */}
      <section className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Inloggad som</h3>
        <p className="text-sm text-gray-500">{currentUser?.email || '...'}</p>
      </section>
    </div>
  )
}
