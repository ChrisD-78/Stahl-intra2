import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, employee_name, reviewer_name, review_date, review_type, goals, notes, status, created_by, created_at, updated_at
       FROM hr_reviews
       ORDER BY review_date DESC NULLS LAST`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load reviews:', error)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_name, reviewer_name, review_date, review_type, goals, notes, status, created_by } = body

    if (!employee_name || !created_by) {
      return NextResponse.json({ error: 'employee_name and created_by are required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO hr_reviews
        (employee_name, reviewer_name, review_date, review_type, goals, notes, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, employee_name, reviewer_name, review_date, review_type, goals, notes, status, created_by, created_at, updated_at`,
      [
        employee_name,
        reviewer_name || null,
        review_date || null,
        review_type || null,
        goals || null,
        notes || null,
        status || 'geplant',
        created_by
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await query('DELETE FROM hr_reviews WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
