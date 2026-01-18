import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// POST - Neuen Benutzer erstellen (nur für Admins)
export async function POST(request: NextRequest) {
  try {
    const { username, password, displayName, role, createdBy } = await request.json()

    // Validierung
    if (!username || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Benutzername, Passwort und Anzeigename sind erforderlich' },
        { status: 400 }
      )
    }

    if (password.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Passwort muss mindestens 5 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Validiere Rolle
    const validRoles = ['Admin', 'Personal', 'Buchhaltung', 'Verwaltung', 'Benutzer']
    const userRole = role && validRoles.includes(role) ? role : 'Benutzer'
    const isAdmin = userRole === 'Admin'

    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockUser = {
      id: Date.now().toString(),
      username,
      displayName,
      role: userRole,
      isAdmin,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    console.log('✅ Neuer Benutzer erstellt (Mock):', mockUser.username)

    return NextResponse.json({
      success: true,
      user: mockUser
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen des Benutzers' },
      { status: 500 }
    )
  }
}
