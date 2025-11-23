'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Verwende die login-Funktion aus dem AuthProvider (jetzt async)
      const success = await login(username, password)
      
      if (success) {
        // Login erfolgreich - Formular zurücksetzen
        setUsername('')
        setPassword('')
        setError('')
        console.log('Login erfolgreich!')
        // AuthProvider kümmert sich um die Weiterleitung
      } else {
        setError('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.')
        setPassword('') // Passwort zurücksetzen bei Fehler
        console.log('Login fehlgeschlagen!')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-2">
        <div className="text-center">
          <div className="mb-0 flex items-center justify-center">
            <img 
              src="/stadtholding-logo-new.svg" 
              alt="Stadtholding Logo" 
              className="h-48 w-auto object-contain"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 backdrop-blur-xl py-4 px-6 shadow-2xl rounded-2xl border border-white/20">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white">
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                placeholder="Ihr vollständiger Name"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                placeholder="Ihr Passwort"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-3">
                <p className="text-sm text-red-100">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg text-sm font-medium text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
              >
                {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
