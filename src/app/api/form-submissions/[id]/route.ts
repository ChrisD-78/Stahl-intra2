import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, status, form_data } = body

    const result = await query(
      `UPDATE form_submissions
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           form_data = COALESCE($4, form_data)
       WHERE id = $5
       RETURNING id, type, title, description, status, submitted_at, form_data, submitted_by, created_at`,
      [title || null, description || null, status || null, form_data || null, id]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update form submission:', error)
    return NextResponse.json(
      { error: 'Failed to update form submission' },
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
    await query('DELETE FROM form_submissions WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete form submission:', error)
    return NextResponse.json(
      { error: 'Failed to delete form submission' },
      { status: 500 }
    )
  }
}
