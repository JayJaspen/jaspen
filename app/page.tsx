'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Inloggning misslyckades')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Något gick fel. Försök igen.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0d1117]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-jaspen-600 rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-jaspen-400 rounded-full opacity-10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-jaspen-700 rounded-full opacity-10 blur-3xl animate-pulse delay-500" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-slide-up">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-jaspen-400 to-jaspen-600 shadow-2xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Jaspen</h1>
          <p className="text-gray-400 mt-1 text-sm">Familjens gemensamma plats</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6 text-center">
            Välkommen tillbaka
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                E-postadress
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="namn@jaspen.se"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-jaspen-400 focus:ring-1 focus:ring-jaspen-400 transition-colors text-sm"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                Lösenord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-jaspen-400 focus:ring-1 focus:ring-jaspen-400 transition-colors text-sm"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-jaspen-500 to-jaspen-600 hover:from-jaspen-400 hover:to-jaspen-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-jaspen-900/40 mt-2 text-sm tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Loggar in...
                </span>
              ) : (
                'Logga in'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          jaspen.se &mdash; för familjen
        </p>
      </div>
    </div>
  )
}
