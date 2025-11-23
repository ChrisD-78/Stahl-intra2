import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET all form submissions
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch form submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    )
  }
}

// POST create new form submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, status, form_data, submitted_by } = body

    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockResult = {
      id: Date.now().toString(),
      type,
      title,
      description: description || null,
      status: status || 'Eingegangen',
      form_data,
      submitted_by,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to create form submission:', error)
    return NextResponse.json(
      { error: 'Failed to create form submission' },
      { status: 500 }
    )
  }
}

// DELETE form submission
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
    console.error('Failed to delete form submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete form submission' },
      { status: 500 }
    )
  }
}
