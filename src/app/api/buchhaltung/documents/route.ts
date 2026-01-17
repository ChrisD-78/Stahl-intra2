import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const docType = searchParams.get('type')
    const q = searchParams.get('q')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const vendor = searchParams.get('vendor')
    const category = searchParams.get('category')

    const clauses: string[] = []
    const params: Array<string | number> = []

    if (status) {
      params.push(status)
      clauses.push(`status = $${params.length}`)
    }
    if (docType) {
      params.push(docType)
      clauses.push(`doc_type = $${params.length}`)
    }
    if (vendor) {
      params.push(vendor)
      clauses.push(`vendor_name = $${params.length}`)
    }
    if (category) {
      params.push(category)
      clauses.push(`category = $${params.length}`)
    }
    if (from) {
      params.push(from)
      clauses.push(`document_date >= $${params.length}`)
    }
    if (to) {
      params.push(to)
      clauses.push(`document_date <= $${params.length}`)
    }
    if (q) {
      params.push(`%${q}%`)
      const idx = params.length
      clauses.push(`(title ILIKE $${idx} OR vendor_name ILIKE $${idx} OR category ILIKE $${idx} OR description ILIKE $${idx})`)
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
    const result = await query(
      `SELECT id, doc_type, title, vendor_name, amount, currency, category, status, document_date, due_date,
              description, file_name, file_url, uploaded_by, created_at, updated_at
       FROM accounting_documents
       ${where}
       ORDER BY created_at DESC`,
      params
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load accounting documents:', error)
    return NextResponse.json(
      { error: 'Failed to load accounting documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      doc_type,
      title,
      vendor_name,
      amount,
      currency,
      category,
      status,
      document_date,
      due_date,
      description,
      file_name,
      file_url,
      uploaded_by
    } = body

    if (!doc_type || !title || !amount || !uploaded_by) {
      return NextResponse.json(
        { error: 'doc_type, title, amount and uploaded_by are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO accounting_documents
        (doc_type, title, vendor_name, amount, currency, category, status, document_date, due_date,
         description, file_name, file_url, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, doc_type, title, vendor_name, amount, currency, category, status, document_date, due_date,
                 description, file_name, file_url, uploaded_by, created_at, updated_at`,
      [
        doc_type,
        title,
        vendor_name || null,
        amount,
        currency || 'EUR',
        category || null,
        status || 'offen',
        document_date || null,
        due_date || null,
        description || null,
        file_name || null,
        file_url || null,
        uploaded_by
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create accounting document:', error)
    return NextResponse.json(
      { error: 'Failed to create accounting document' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await query('DELETE FROM accounting_documents WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete accounting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete accounting document' },
      { status: 500 }
    )
  }
}
