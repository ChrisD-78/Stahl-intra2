import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// PUT update form submission
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, status, form_data } = body

    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockSubmission = {
      id,
      title: title || 'Mock Title',
      description: description || null,
      status: status || 'Eingegangen',
      form_data: form_data || {},
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(mockSubmission)
  } catch (error) {
    console.error('Failed to update form submission:', error)
    return NextResponse.json(
      { error: 'Failed to update form submission' },
      { status: 500 }
    )
  }
}

// DELETE form submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
