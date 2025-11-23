import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET all external proofs
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch proofs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proofs' },
      { status: 500 }
    )
  }
}

// POST create new proof
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bezeichnung, vorname, nachname, datum, pdf_name, pdf_url } = body

    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockResult = {
      id: Date.now().toString(),
      bezeichnung,
      vorname,
      nachname,
      datum,
      pdf_name: pdf_name || null,
      pdf_url: pdf_url || null,
      created_at: new Date().toISOString()
    }

    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to create proof:', error)
    return NextResponse.json(
      { error: 'Failed to create proof' },
      { status: 500 }
    )
  }
}

// DELETE proof
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
    console.error('Failed to delete proof:', error)
    return NextResponse.json(
      { error: 'Failed to delete proof' },
      { status: 500 }
    )
  }
}
