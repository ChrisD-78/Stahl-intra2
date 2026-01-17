import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

const ALLOWED_FIELDS = [
  'employee_name',
  'reviewer_name',
  'review_date',
  'review_type',
  'goals',
  'notes',
  'status'
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updates: string[] = []
    const values: Array<string | null> = []

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
      `UPDATE hr_reviews
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, employee_name, reviewer_name, review_date, review_type, goals, notes, status, created_by, created_at, updated_at`,
      values
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await query('DELETE FROM hr_reviews WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
