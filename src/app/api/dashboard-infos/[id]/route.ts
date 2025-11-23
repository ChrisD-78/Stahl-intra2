import { NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { title, content, is_popup } = await request.json()
    const { id } = await params

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockResult = {
      id,
      title,
      content,
      is_popup: is_popup || false,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: mockResult })
  } catch (error) {
    console.error('Failed to update dashboard info:', error)
    return NextResponse.json({ 
      error: 'Failed to update dashboard info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
