import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET quiz with questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Mock-Daten (später durch echte Datenbank ersetzen)
    return NextResponse.json(
      { error: 'Quiz not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Failed to fetch quiz:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}

