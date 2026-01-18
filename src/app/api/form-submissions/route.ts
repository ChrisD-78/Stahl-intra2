import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, type, title, description, status, submitted_at, form_data, submitted_by, created_at
       FROM form_submissions
       ORDER BY submitted_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch form submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, status, form_data, submitted_by } = body

    if (!type || !title || !form_data || !submitted_by) {
      return NextResponse.json(
        { error: 'type, title, form_data and submitted_by are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO form_submissions
        (type, title, description, status, form_data, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, type, title, description, status, submitted_at, form_data, submitted_by, created_at`,
      [type, title, description || null, status || 'Eingegangen', form_data, submitted_by]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create form submission:', error)
    return NextResponse.json(
      { error: 'Failed to create form submission' },
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
