import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// PUT update jour-fixe entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      `UPDATE jour_fixe_entries 
       SET 
        bereich = $1,
        kategorie = $2,
        vereinbart_am = $3,
        aufgabenfeld = $4,
        klaerung = $5,
        verantwortlich = $6,
        beteiligt = $7,
        termin_soll = $8,
        abschluss_termin = $9,
        prioritaet = $10,
        status = $11,
        pdf_url = $12,
        pdf_name = $13,
        updated_at = NOW()
       WHERE id = $14
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
        pdfName || null,
        params.id
      ]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update jour-fixe entry:', error)
    return NextResponse.json(
      { error: 'Failed to update jour-fixe entry', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
