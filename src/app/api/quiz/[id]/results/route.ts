import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung

// GET detailed quiz results
// For regular users: only their own results
// For admins: all results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userName = searchParams.get('user_name')
    const isAdmin = searchParams.get('is_admin') === 'true'

    // Mock-Daten (später durch echte Datenbank ersetzen)
    if (!userName && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Benutzername erforderlich' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      quiz: { id, title: 'Mock Quiz', total_questions: 0, passing_score: 70 },
      results: []
    })
  } catch (error) {
    console.error('Failed to fetch quiz results:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Ergebnisse' },
      { status: 500 }
    )
  }
}

