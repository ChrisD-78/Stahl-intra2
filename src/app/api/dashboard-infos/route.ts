import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET all dashboard infos
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch dashboard infos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard infos' },
      { status: 500 }
    )
  }
}

// POST create new dashboard info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, timestamp, pdf_name, pdf_url, is_popup } = body
    
    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockResult = {
      id: Date.now().toString(),
      title,
      content,
      timestamp,
      pdf_name: pdf_name || null,
      pdf_url: pdf_url || null,
      is_popup: is_popup || false,
      created_at: new Date().toISOString()
    }
    
    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to create dashboard info:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard info' },
      { status: 500 }
    )
  }
}

// DELETE dashboard info
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
    console.error('Failed to delete dashboard info:', error)
    return NextResponse.json(
      { error: 'Failed to delete dashboard info' },
      { status: 500 }
    )
  }
}
