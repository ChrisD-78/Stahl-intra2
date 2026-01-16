import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// PATCH update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    // Erstelle dynamisches UPDATE-Statement
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(body.title)
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(body.description)
    }
    if (body.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`)
      values.push(body.priority)
    }
    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex++}`)
      values.push(body.status)
    }
    if (body.due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`)
      values.push(body.due_date)
    }
    if (body.assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`)
      values.push(body.assigned_to)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)
    const result = await query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, title, description, priority, status, due_date as "due_date", assigned_to as "assigned_to", created_at, updated_at`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task', details: error?.message },
      { status: 500 }
    )
  }
}
