import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET all completed trainings
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch completed trainings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch completed trainings' },
      { status: 500 }
    )
  }
}

// POST mark training as completed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      training_id, 
      training_title,
      participant_name,
      participant_surname,
      completed_date,
      score,
      category,
      instructor,
      duration,
      completed_by, 
      notes 
    } = body

    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockResult = {
      id: Date.now().toString(),
      training_id,
      training_title: training_title || null,
      participant_name: participant_name || null,
      participant_surname: participant_surname || null,
      completed_date: completed_date || null,
      score: score || null,
      category: category || null,
      instructor: instructor || null,
      duration: duration || null,
      completed_by: completed_by || 'System',
      notes: notes || null,
      completed_at: new Date().toISOString()
    }

    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to mark training as completed:', error)
    return NextResponse.json(
      { error: 'Failed to mark training as completed' },
      { status: 500 }
    )
  }
}

// DELETE completed training
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Mock-Löschung (später durch echte Datenbank ersetzen)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete completed training:', error)
    return NextResponse.json(
      { error: 'Failed to delete completed training' },
      { status: 500 }
    )
  }
}
