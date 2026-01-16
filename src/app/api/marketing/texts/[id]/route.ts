import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// PATCH update text (for status changes, approvals)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, approvedBy } = body

    let sql = 'UPDATE marketing_texts SET'
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
      updates.push(`approved_at = NOW()`)
    }

    if (status === 'freigegeben' && !approvedBy) {
      updates.push(`approved_at = NOW()`)
    }

    updates.push(`updated_at = NOW()`)
    updates.push(`WHERE id = $${paramIndex++}`)
    values.push(id)

    sql += ' ' + updates.join(', ')

    sql += ` RETURNING 
      id, 
      title, 
      content, 
      type,
      created_by as "createdBy",
      created_at as "createdAt",
      status,
      approved_by as "approvedBy",
      approved_at as "approvedAt"`

    const result = await query(sql, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Text not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update text:', error)
    return NextResponse.json(
      { error: 'Failed to update text', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
