import { NextRequest, NextResponse } from 'next/server'

export interface Erledigungsvermerk {
  id: string
  text: string
  erstelltVon: string
  erstelltAm: string
}

export interface Besprechungspunkt {
  id: string
  titel: string
  beschreibung: string
  verantwortlich: string
  frist?: string
  prioritaet?: 'Niedrig' | 'Mittel' | 'Hoch'
  status: 'offen' | 'in_arbeit' | 'erledigt'
  notizen?: string
  erledigungsvermerke?: Erledigungsvermerk[]
  erstelltVon?: string
  erstelltAm?: string
}

export interface Besprechung {
  id: string
  titel: string
  bereich: string
  datum: string
  uhrzeit: string
  ort?: string
  teilnehmer: string[]
  protokoll?: string
  status: 'geplant' | 'durchgefuehrt' | 'verschoben' | 'abgesagt'
  punkte: Besprechungspunkt[]
  erstelltVon: string
  erstelltAm: string
  aktualisiertAm: string
}

// Mock-Daten (später durch echte Datenbank ersetzen)
let mockBesprechungen: Besprechung[] = []

// GET - Alle Besprechungen abrufen
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (id) {
      const besprechung = mockBesprechungen.find(b => b.id === id)
      if (!besprechung) {
        return NextResponse.json(
          { error: 'Besprechung nicht gefunden' },
          { status: 404 }
        )
      }
      return NextResponse.json(besprechung)
    }

    return NextResponse.json(mockBesprechungen)
  } catch (error) {
    console.error('Fehler beim Abrufen der Besprechungen:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Besprechungen' },
      { status: 500 }
    )
  }
}

// POST - Neue Besprechung erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titel, bereich, datum, uhrzeit, ort, teilnehmer, erstelltVon } = body

    if (!titel || !bereich || !datum || !uhrzeit) {
      return NextResponse.json(
        { error: 'Titel, Bereich, Datum und Uhrzeit sind erforderlich' },
        { status: 400 }
      )
    }

    const neueBesprechung: Besprechung = {
      id: Date.now().toString(),
      titel,
      bereich,
      datum,
      uhrzeit,
      ort: ort || '',
      teilnehmer: teilnehmer || [],
      protokoll: '',
      status: 'geplant',
      punkte: [],
      erstelltVon: erstelltVon || 'System',
      erstelltAm: new Date().toISOString(),
      aktualisiertAm: new Date().toISOString()
    }

    mockBesprechungen.push(neueBesprechung)
    return NextResponse.json(neueBesprechung, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen der Besprechung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Besprechung' },
      { status: 500 }
    )
  }
}

// PUT - Besprechung aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      )
    }

    const index = mockBesprechungen.findIndex(b => b.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Besprechung nicht gefunden' },
        { status: 404 }
      )
    }

    mockBesprechungen[index] = {
      ...mockBesprechungen[index],
      ...updates,
      aktualisiertAm: new Date().toISOString()
    }

    return NextResponse.json(mockBesprechungen[index])
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Besprechung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Besprechung' },
      { status: 500 }
    )
  }
}

// DELETE - Besprechung löschen
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      )
    }

    const index = mockBesprechungen.findIndex(b => b.id === id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Besprechung nicht gefunden' },
        { status: 404 }
      )
    }

    mockBesprechungen.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen der Besprechung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Besprechung' },
      { status: 500 }
    )
  }
}

