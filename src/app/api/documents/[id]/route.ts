import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// PATCH update document
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, category, tags } = body

    const result = await query(
      `UPDATE documents 
       SET title = $1, description = $2, category = $3, tags = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, title, description, category, file_name, file_size_mb, file_type, tags, uploaded_at, uploaded_by, file_url`,
      [title, description, category, tags || [], id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update document:', error)
    return NextResponse.json(
      { error: 'Failed to update document', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await query('DELETE FROM documents WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
