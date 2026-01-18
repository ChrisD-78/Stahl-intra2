import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Login für Entwicklung
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Benutzername und Passwort erforderlich' },
        { status: 400 }
      )
    }

    // Mock-User für Entwicklung (später durch echte Datenbank ersetzen)
    // Standard-Login: staho / staho1
    const mockUsers = [
      {
        id: '1',
        username: 'staho',
        password: 'staho1',
        display_name: 'Stadtholding',
        is_admin: true,
        role: 'Admin',
        is_active: true
      }
    ]

    const user = mockUsers.find(u => u.username === username)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Benutzerkonto ist deaktiviert' },
        { status: 403 }
      )
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    // Login erfolgreich
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        isAdmin: user.is_admin,
        role: user.role || 'Benutzer'
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Serverfehler beim Login' },
      { status: 500 }
    )
  }
}
