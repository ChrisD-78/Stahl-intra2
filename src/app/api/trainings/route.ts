import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET all trainings
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch trainings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainings' },
      { status: 500 }
    )
  }
}

// POST create new training
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockResult = {
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to create training:', error)
    return NextResponse.json(
      { error: 'Failed to create training' },
      { status: 500 }
    )
  }
}

// DELETE training
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
    console.error('Failed to delete training:', error)
    return NextResponse.json(
      { error: 'Failed to delete training' },
      { status: 500 }
    )
  }
}
