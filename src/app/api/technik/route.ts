import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNGEN DEAKTIVIERT - Mock-Implementierung

export async function GET() {
  try {
    // Mock: Leeres Array zurückgeben
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch technik inspections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inspections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      rubrik,
      id_nr,
      name,
      standort,
      bild_url,
      bild_name,
      letzte_pruefung,
      interval,
      naechste_pruefung,
      bericht_url,
      bericht_name,
      bemerkungen,
      in_betrieb,
      kontaktdaten,
      status
    } = body

    // Mock: Dummy-Daten zurückgeben
    const mockResult = {
      id: Date.now().toString(),
      rubrik,
      id_nr,
      name,
      standort,
      bild_url: bild_url || null,
      bild_name: bild_name || null,
      letzte_pruefung,
      interval,
      naechste_pruefung,
      bericht_url: bericht_url || null,
      bericht_name: bericht_name || null,
      bemerkungen: bemerkungen || null,
      in_betrieb: in_betrieb !== undefined ? in_betrieb : true,
      kontaktdaten: kontaktdaten || null,
      status: status || 'Offen',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return NextResponse.json(mockResult)
  } catch (error) {
    console.error('Failed to create technik inspection:', error)
    return NextResponse.json(
      { error: 'Failed to create inspection' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      rubrik,
      id_nr,
      name,
      standort,
      bild_url,
      bild_name,
      letzte_pruefung,
      interval,
      naechste_pruefung,
      bericht_url,
      bericht_name,
      bemerkungen,
      in_betrieb,
      kontaktdaten,
      status
    } = body

    // Mock: Dummy-Daten zurückgeben
    const mockResult = {
      id,
      rubrik,
      id_nr,
      name,
      standort,
      bild_url: bild_url || null,
      bild_name: bild_name || null,
      letzte_pruefung,
      interval,
      naechste_pruefung,
      bericht_url: bericht_url || null,
      bericht_name: bericht_name || null,
      bemerkungen: bemerkungen || null,
      in_betrieb: in_betrieb !== undefined ? in_betrieb : true,
      kontaktdaten: kontaktdaten || null,
      status: status || 'Offen',
      updated_at: new Date().toISOString()
    }
    return NextResponse.json(mockResult)
  } catch (error) {
    console.error('Failed to update technik inspection:', error)
    return NextResponse.json(
      { error: 'Failed to update inspection' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Mock: Erfolg zurückgeben
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete technik inspection:', error)
    return NextResponse.json(
      { error: 'Failed to delete inspection' },
      { status: 500 }
    )
  }
}

