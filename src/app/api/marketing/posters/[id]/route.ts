import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// PATCH update poster (for status changes, approvals, sending)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, approvedBy, sentTo } = body

    let sql = 'UPDATE marketing_posters SET'
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (status) {
      updates.push(`status = $${paramIndex++}`)
      values.push(status)
    }

    if (approvedBy) {
      updates.push(`approved_by = $${paramIndex++}`)
      values.push(approvedBy)
    }

    if (status === 'freigegeben' && approvedBy && !body.approvedAt) {
      updates.push(`approved_at = NOW()`)
    }

    if (sentTo) {
      updates.push(`sent_to = $${paramIndex++}`)
      values.push(sentTo)
      updates.push(`sent_at = NOW()`)
    }

    if (status === 'versendet' && sentTo) {
      updates.push(`sent_at = NOW()`)
    }

    updates.push(`updated_at = NOW()`)
    updates.push(`WHERE id = $${paramIndex++}`)
    values.push(id)

    sql += ' ' + updates.join(', ')

    sql += ` RETURNING 
      id, 
      title, 
      description, 
      file_url as "fileUrl",
      file_name as "fileName",
      file_size as "fileSize",
      uploaded_by as "uploadedBy",
      uploaded_at as "uploadedAt",
      status,
      approved_by as "approvedBy",
      sent_to as "sentTo",
      sent_at as "sentAt"`

    const result = await query(sql, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Poster not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update poster:', error)
    return NextResponse.json(
      { error: 'Failed to update poster', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
