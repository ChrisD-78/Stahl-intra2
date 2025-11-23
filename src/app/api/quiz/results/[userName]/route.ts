import { NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userName: string }> }
) {
  try {
    const { userName } = await params
    
    if (!userName) {
      return NextResponse.json({ error: 'User name is required' }, { status: 400 })
    }

    // Mock-Löschung (später durch echte Datenbank ersetzen)
    return NextResponse.json({ 
      success: true, 
      deletedCount: 0,
      message: `Alle Quiz-Ergebnisse von ${userName} wurden gelöscht.`
    })
  } catch (error) {
    console.error('Failed to delete quiz results:', error)
    return NextResponse.json(
      { error: 'Failed to delete quiz results' },
      { status: 500 }
    )
  }
}

