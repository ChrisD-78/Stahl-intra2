import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

const ALLOWED_FIELDS = [
  'doc_type',
  'title',
  'vendor_name',
  'amount',
  'currency',
  'category',
  'status',
  'document_date',
  'due_date',
  'description',
  'file_name',
  'file_url'
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updates: string[] = []
    const values: Array<string | number | null> = []

    ALLOWED_FIELDS.forEach((field) => {
      if (field in body) {
        values.push(body[field] ?? null)
        updates.push(`${field} = $${values.length}`)
      }
    })

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    values.push(id)

    const result = await query(
      `UPDATE accounting_documents
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, doc_type, title, vendor_name, amount, currency, category, status, document_date, due_date,
                 description, file_name, file_url, uploaded_by, created_at, updated_at`,
      values
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update accounting document:', error)
    return NextResponse.json(
      { error: 'Failed to update accounting document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
