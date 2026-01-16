import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// PATCH update complaint
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { assignedTo, status, responseMethod, responseText, resolution, responseBy } = body

    let sql = 'UPDATE complaints SET'
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`)
      values.push(assignedTo)
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`)
      values.push(status)
    }

    if (responseMethod !== undefined) {
      updates.push(`response_method = $${paramIndex++}`)
      values.push(responseMethod)
    }

    if (responseText !== undefined) {
      updates.push(`response_text = $${paramIndex++}`)
      values.push(responseText)
    }

    if (resolution !== undefined) {
      updates.push(`resolution = $${paramIndex++}`)
      values.push(resolution)
    }

    if (responseBy !== undefined) {
      updates.push(`response_by = $${paramIndex++}`)
      values.push(responseBy)
    }

    if (responseMethod || responseText || responseBy) {
      updates.push(`response_date = NOW()`)
    }

    if (resolution) {
      updates.push(`resolved_at = NOW()`)
    }

    updates.push(`updated_at = NOW()`)
    updates.push(`WHERE id = $${paramIndex++}`)
    values.push(id)

    sql += ' ' + updates.join(', ')

    sql += ` RETURNING 
      id, 
      title, 
      description, 
      category, 
      area, 
      submitted_by as "submittedBy",
      submitted_at as "submittedAt",
      assigned_to as "assignedTo",
      status,
      response_method as "responseMethod",
      response_date as "responseDate",
      response_by as "responseBy",
      response_text as "responseText",
      resolution,
      resolved_at as "resolvedAt"`

    const result = await query(sql, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update complaint:', error)
    return NextResponse.json(
      { error: 'Failed to update complaint', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
