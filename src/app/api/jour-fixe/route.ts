import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all jour-fixe entries
export async function GET() {
  try {
    const result = await query(
      `SELECT 
        id, 
        bereich, 
        kategorie, 
        vereinbart_am as "vereinbartAm",
        aufgabenfeld,
        klaerung,
        verantwortlich,
        beteiligt,
        termin_soll as "terminSoll",
        abschluss_termin as "abschlussTermin",
        prioritaet,
        status,
        pdf_url as "pdfUrl",
        pdf_name as "pdfName",
        created_at as "createdAt"
      FROM jour_fixe_entries 
      ORDER BY created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch jour-fixe entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jour-fixe entries', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new jour-fixe entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      bereich, 
      kategorie, 
      vereinbartAm, 
      aufgabenfeld, 
      klaerung, 
      verantwortlich, 
      beteiligt, 
      terminSoll, 
      abschlussTermin, 
      prioritaet, 
      status, 
      pdfUrl, 
      pdfName 
    } = body
    
    const result = await query(
      `INSERT INTO jour_fixe_entries 
        (bereich, kategorie, vereinbart_am, aufgabenfeld, klaerung, verantwortlich, beteiligt, termin_soll, abschluss_termin, prioritaet, status, pdf_url, pdf_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING 
        id, 
        bereich, 
        kategorie, 
        vereinbart_am as "vereinbartAm",
        aufgabenfeld,
        klaerung,
        verantwortlich,
        beteiligt,
        termin_soll as "terminSoll",
        abschluss_termin as "abschlussTermin",
        prioritaet,
        status,
        pdf_url as "pdfUrl",
        pdf_name as "pdfName",
        created_at as "createdAt"`,
      [
        bereich, 
        kategorie, 
        vereinbartAm || null, 
        aufgabenfeld, 
        klaerung || null, 
        verantwortlich, 
        beteiligt || null, 
        terminSoll || null, 
        abschlussTermin || null, 
        prioritaet || 'Mittel', 
        status || 'warte', 
        pdfUrl || null, 
        pdfName || null
      ]
    )
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create jour-fixe entry:', error)
    return NextResponse.json(
      { error: 'Failed to create jour-fixe entry', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE jour-fixe entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await query('DELETE FROM jour_fixe_entries WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete jour-fixe entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete jour-fixe entry' },
      { status: 500 }
    )
  }
}
