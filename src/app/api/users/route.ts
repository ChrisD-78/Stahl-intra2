import { NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    const mockUsers = [
      {
        id: '1',
        username: 'staho',
        display_name: 'Stadtholding',
        is_admin: true,
        role: 'Admin',
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null,
        created_by: 'system'
      }
    ]

    return NextResponse.json({
      success: true,
      users: mockUsers
    })

  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Benutzer' },
      { status: 500 }
    )
  }
}
