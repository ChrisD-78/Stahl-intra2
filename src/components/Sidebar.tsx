'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useState } from 'react'

const Sidebar = () => {
  const pathname = usePathname()
  const { currentUser, logout, isAdmin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/aufgaben', label: 'Aufgaben', icon: '📋' },
    { href: '/formulare', label: 'Formulare', icon: '📝' },
    { href: '/dokumente', label: 'Dokumente', icon: '📄' },
    { href: '/marketing', label: 'Marketing', icon: '📢' },
    { href: '/projektmanagement', label: 'Projektmanagement', icon: '📊' },
    { href: '/beschwerdemanagement', label: 'Beschwerdemanagement', icon: '📢' },
    { href: '/schulungen', label: 'Schulungen', icon: '🎓' },
  ]

  const adminNavItems = [
    { href: '/admin/users', label: 'Benutzerverwaltung', icon: '👥' },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-blue-900 lg:bg-blue-900/20 backdrop-blur-xl border-r border-blue-200/30 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Logo */}
      <div className="flex-shrink-0 p-4 border-b border-blue-200/30">
        <div className="flex items-center justify-center">
          <img 
            src="/stadtholding-logo-new.svg" 
            alt="Stadtholding Logo" 
            className="h-24 w-auto object-contain"
          />
        </div>
      </div>
      
      {/* User Info */}
      <div className="flex-shrink-0 p-4 border-b border-blue-200/30">
        <div className="flex items-center space-x-3 p-3 bg-blue-800/30 backdrop-blur-sm rounded-xl border border-blue-300/30">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">
              {currentUser?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {currentUser || 'Benutzer'}
            </p>
            <p className="text-xs text-white font-medium">Angemeldet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 min-h-0">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'bg-blue-800/60 border-r-2 border-blue-400 shadow-lg backdrop-blur-sm'
                      : 'hover:bg-blue-800/40 hover:shadow-md backdrop-blur-sm'
                  } text-white`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium flex-1">{item.label}</span>
                </Link>
              </li>
            )
          })}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <li className="pt-4 pb-1">
                <div className="px-4 text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
                  Administration
                </div>
              </li>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-700/60 text-white border-r-2 border-purple-400 shadow-lg backdrop-blur-sm'
                          : 'text-white hover:bg-purple-700/40 hover:text-white hover:shadow-md backdrop-blur-sm'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.label}</span>
                      <span className="text-[10px] bg-purple-500/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">Admin</span>
                    </Link>
                  </li>
                )
              })}
            </>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-blue-200/30">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white hover:text-white hover:bg-red-600/40 rounded-xl transition-all duration-200 backdrop-blur-sm border border-blue-300/30 hover:border-red-400/50"
        >
          <span>🚪</span>
          <span>Abmelden</span>
        </button>
      </div>
      </div>
    </>
  )
}

export default Sidebar
