import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// POST submit quiz results
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { user_name, answers, time_taken_seconds } = body

    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const totalQuestions = answers?.length || 0
    const correctCount = 0
    const percentage = 0

    return NextResponse.json({
      success: true,
      result: {
        score: correctCount,
        total: totalQuestions,
        percentage: percentage,
        passed: percentage >= 70
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to submit quiz:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}

