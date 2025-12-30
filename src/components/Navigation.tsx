'use client'

import { useAuth } from '@/components/AuthProvider'

const Navigation = () => {
  const { isLoggedIn, currentUser } = useAuth()

  // Wenn nicht angemeldet, keine Navigation anzeigen
  if (!isLoggedIn) {
    return null
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="ml-64 px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img 
              src="/stadtholding-logo.png" 
              alt="Stadtholding Logo" 
              className="h-8 lg:h-10 w-auto object-contain"
            />
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
              Stadtholding Landau
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Benutzername anzeigen */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {currentUser?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-blue-900">
                Willkommen, {currentUser}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
