import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// PUT - Passwort für einen Benutzer zurücksetzen (nur für Admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { newPassword, adminUser } = await request.json()

    // Validierung
    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'Neues Passwort ist erforderlich' },
        { status: 400 }
      )
    }

    if (newPassword.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Passwort muss mindestens 5 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Mock-Daten (später durch echte Datenbank ersetzen)
    console.log(`✅ Passwort für Benutzer ${id} wurde von ${adminUser || 'Admin'} zurückgesetzt (Mock)`)

    return NextResponse.json({
      success: true,
      message: `Passwort wurde erfolgreich zurückgesetzt`
    })

  } catch (error) {
    console.error('Failed to reset password:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Zurücksetzen des Passworts' },
      { status: 500 }
    )
  }
}

