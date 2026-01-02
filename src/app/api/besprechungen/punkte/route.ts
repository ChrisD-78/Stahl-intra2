import { NextRequest, NextResponse } from 'next/server'
import { Besprechung, Besprechungspunkt } from '../route'

// Mock-Daten (später durch echte Datenbank ersetzen)
// Diese Route nutzt die gleichen mockBesprechungen wie die Hauptroute
// In einer echten Implementierung würde man hier auf eine Datenbank zugreifen

// POST - Neuen Besprechungspunkt hinzufügen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { besprechungId, titel, beschreibung, verantwortlich, frist, notizen, erstelltVon } = body

    if (!besprechungId || !titel) {
      return NextResponse.json(
        { error: 'Besprechungs-ID und Titel sind erforderlich' },
        { status: 400 }
      )
    }

    // In einer echten Implementierung würde man hier die Besprechung aus der DB laden
    // Für jetzt verwenden wir eine einfache Mock-Implementierung
    const neuerPunkt: Besprechungspunkt = {
      id: Date.now().toString(),
      titel,
      beschreibung: beschreibung || '',
      verantwortlich: verantwortlich || '',
      frist: frist || undefined,
      status: 'offen',
      alsAufgabeErstellt: false,
      notizen: notizen || '',
      erstelltVon: erstelltVon || 'System',
      erstelltAm: new Date().toISOString()
    }

    // In einer echten Implementierung würde man hier die Besprechung aktualisieren
    return NextResponse.json(neuerPunkt, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen des Besprechungspunkts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Besprechungspunkts' },
      { status: 500 }
    )
  }
}

// PUT - Besprechungspunkt aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { besprechungId, punktId, ...updates } = body

    if (!besprechungId || !punktId) {
      return NextResponse.json(
        { error: 'Besprechungs-ID und Punkt-ID sind erforderlich' },
        { status: 400 }
      )
    }

    // In einer echten Implementierung würde man hier die Besprechung aus der DB laden und aktualisieren
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Besprechungspunkts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Besprechungspunkts' },
      { status: 500 }
    )
  }
}

// DELETE - Besprechungspunkt löschen
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const besprechungId = searchParams.get('besprechungId')
    const punktId = searchParams.get('punktId')

    if (!besprechungId || !punktId) {
      return NextResponse.json(
        { error: 'Besprechungs-ID und Punkt-ID sind erforderlich' },
        { status: 400 }
      )
    }

    // In einer echten Implementierung würde man hier die Besprechung aus der DB laden und den Punkt entfernen
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Besprechungspunkts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Besprechungspunkts' },
      { status: 500 }
    )
  }
}


