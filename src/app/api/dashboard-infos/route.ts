import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET all dashboard infos
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    const mockInfos = [
      {
        id: 'neujahrsgruss-2026',
        title: 'Neujahrsgruß 2026',
        content: `Liebe Mitarbeiterinnen und Mitarbeiter der Stadtholding Landau,

das Jahr 2025 liegt hinter uns – ein Jahr voller Herausforderungen, Projekte und gemeinsamer Erfolge. Gemeinsam haben wir viel erreicht und unsere Stadt ein Stück weitergebracht. Dafür gebührt Ihnen allen ein herzliches Dankeschön!

Ihr Engagement, Ihre Kompetenz und Ihr Einsatz sind das Fundament unserer Arbeit. Auch in herausfordernden Zeiten haben Sie bewiesen, dass wir als Team gemeinsam Lösungen finden und Ziele erreichen können.

Für das neue Jahr 2026 wünsche ich Ihnen persönlich und beruflich alles Gute. Möge es ein Jahr voller Gesundheit, Zufriedenheit und positiver Erlebnisse werden. Lassen Sie uns gemeinsam mit Energie und Zuversicht die Aufgaben angehen, die vor uns liegen.

Ich freue mich auf die weitere Zusammenarbeit mit Ihnen und darauf, auch im neuen Jahr gemeinsam Erfolge zu feiern.

Einen guten Start ins Jahr 2026!

Mit herzlichen Grüßen`,
        timestamp: new Date('2026-01-01').toISOString(),
        pdf_name: null,
        pdf_url: null,
        is_popup: false,
        created_at: new Date('2026-01-01').toISOString()
      }
    ]
    return NextResponse.json(mockInfos)
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
