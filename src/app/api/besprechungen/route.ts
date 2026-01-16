import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

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

// Hilfsfunktion: Besprechung mit Punkten und Erledigungsvermerken laden
async function loadBesprechungMitPunkten(besprechungId: string) {
  // Lade Besprechung
  const besprechungResult = await query(
    `SELECT id, titel, bereich, datum, uhrzeit, ort, teilnehmer, protokoll, status, 
            erstellt_von as "erstelltVon", 
            erstellt_am as "erstelltAm", 
            aktualisiert_am as "aktualisiertAm"
     FROM besprechungen WHERE id = $1`,
    [besprechungId]
  )

  if (besprechungResult.rows.length === 0) {
    return null
  }

  const besprechung = besprechungResult.rows[0]

  // Lade Besprechungspunkte
  const punkteResult = await query(
    `SELECT id, titel, beschreibung, verantwortlich, frist, prioritaet, status, notizen,
            erstellt_von as "erstelltVon",
            erstellt_am as "erstelltAm"
     FROM besprechungspunkte 
     WHERE besprechung_id = $1 
     ORDER BY erstellt_am ASC`,
    [besprechungId]
  )

  const punkte = await Promise.all(
    punkteResult.rows.map(async (punkt) => {
      // Lade Erledigungsvermerke für jeden Punkt
      const vermerkeResult = await query(
        `SELECT id, text, erstellt_von as "erstelltVon", erstellt_am as "erstelltAm"
         FROM erledigungsvermerke 
         WHERE besprechungspunkt_id = $1 
         ORDER BY erstellt_am ASC`,
        [punkt.id]
      )

      return {
        ...punkt,
        erledigungsvermerke: vermerkeResult.rows
      }
    })
  )

  return {
    ...besprechung,
    punkte
  }
}

// GET - Alle Besprechungen abrufen
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (id) {
      const besprechung = await loadBesprechungMitPunkten(id)
      if (!besprechung) {
        return NextResponse.json(
          { error: 'Besprechung nicht gefunden' },
          { status: 404 }
        )
      }
      return NextResponse.json(besprechung)
    }

    // Lade alle Besprechungen
    const result = await query(
      `SELECT id, titel, bereich, datum, uhrzeit, ort, teilnehmer, protokoll, status,
              erstellt_von as "erstelltVon",
              erstellt_am as "erstelltAm",
              aktualisiert_am as "aktualisiertAm"
       FROM besprechungen 
       ORDER BY datum DESC, uhrzeit DESC`
    )

    // Lade Punkte für alle Besprechungen (vereinfacht, nur IDs)
    const besprechungen = await Promise.all(
      result.rows.map(async (besprechung) => {
        const punkteCount = await query(
          'SELECT COUNT(*) as count FROM besprechungspunkte WHERE besprechung_id = $1',
          [besprechung.id]
        )
        return {
          ...besprechung,
          punkte: [] // Für Liste nicht alle Details laden
        }
      })
    )

    return NextResponse.json(besprechungen)
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Besprechungen:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Besprechungen', details: error?.message },
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

    const result = await query(
      `INSERT INTO besprechungen (titel, bereich, datum, uhrzeit, ort, teilnehmer, protokoll, status, erstellt_von)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, titel, bereich, datum, uhrzeit, ort, teilnehmer, protokoll, status,
                 erstellt_von as "erstelltVon",
                 erstellt_am as "erstelltAm",
                 aktualisiert_am as "aktualisiertAm"`,
      [
        titel,
        bereich,
        datum,
        uhrzeit,
        ort || null,
        teilnehmer || [],
        '',
        'geplant',
        erstelltVon || 'System'
      ]
    )

    const neueBesprechung = {
      ...result.rows[0],
      punkte: []
    }

    return NextResponse.json(neueBesprechung, { status: 201 })
  } catch (error: any) {
    console.error('Fehler beim Erstellen der Besprechung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Besprechung', details: error?.message },
      { status: 500 }
    )
  }
}

// PUT - Besprechung aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, punkte, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Aktualisiere Besprechung
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.titel !== undefined) {
      updateFields.push(`titel = $${paramIndex++}`)
      values.push(updates.titel)
    }
    if (updates.bereich !== undefined) {
      updateFields.push(`bereich = $${paramIndex++}`)
      values.push(updates.bereich)
    }
    if (updates.datum !== undefined) {
      updateFields.push(`datum = $${paramIndex++}`)
      values.push(updates.datum)
    }
    if (updates.uhrzeit !== undefined) {
      updateFields.push(`uhrzeit = $${paramIndex++}`)
      values.push(updates.uhrzeit)
    }
    if (updates.ort !== undefined) {
      updateFields.push(`ort = $${paramIndex++}`)
      values.push(updates.ort)
    }
    if (updates.teilnehmer !== undefined) {
      updateFields.push(`teilnehmer = $${paramIndex++}`)
      values.push(updates.teilnehmer)
    }
    if (updates.protokoll !== undefined) {
      updateFields.push(`protokoll = $${paramIndex++}`)
      values.push(updates.protokoll)
    }
    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`)
      values.push(updates.status)
    }

    if (updateFields.length > 0) {
      values.push(id)
      await query(
        `UPDATE besprechungen SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        values
      )
    }

    // Aktualisiere Punkte, falls vorhanden
    if (punkte && Array.isArray(punkte)) {
      // Lösche alte Punkte
      await query('DELETE FROM besprechungspunkte WHERE besprechung_id = $1', [id])

      // Füge neue Punkte ein
      for (const punkt of punkte) {
        const punktResult = await query(
          `INSERT INTO besprechungspunkte 
           (besprechung_id, titel, beschreibung, verantwortlich, frist, prioritaet, status, notizen, erstellt_von)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [
            id,
            punkt.titel,
            punkt.beschreibung || null,
            punkt.verantwortlich || null,
            punkt.frist || null,
            punkt.prioritaet || null,
            punkt.status || 'offen',
            punkt.notizen || null,
            punkt.erstelltVon || 'System'
          ]
        )

        const punktId = punktResult.rows[0].id

        // Füge Erledigungsvermerke ein, falls vorhanden
        if (punkt.erledigungsvermerke && Array.isArray(punkt.erledigungsvermerke)) {
          for (const vermerk of punkt.erledigungsvermerke) {
            await query(
              `INSERT INTO erledigungsvermerke (besprechungspunkt_id, text, erstellt_von)
               VALUES ($1, $2, $3)`,
              [punktId, vermerk.text, vermerk.erstelltVon || 'System']
            )
          }
        }
      }
    }

    // Lade aktualisierte Besprechung
    const aktualisierteBesprechung = await loadBesprechungMitPunkten(id)
    if (!aktualisierteBesprechung) {
      return NextResponse.json(
        { error: 'Besprechung nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(aktualisierteBesprechung)
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren der Besprechung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Besprechung', details: error?.message },
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

    // CASCADE löscht automatisch alle Punkte und Erledigungsvermerke
    const result = await query('DELETE FROM besprechungen WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Besprechung nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Fehler beim Löschen der Besprechung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Besprechung', details: error?.message },
      { status: 500 }
    )
  }
}

