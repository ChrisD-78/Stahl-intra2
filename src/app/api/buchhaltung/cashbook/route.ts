import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, entry_type, amount, entry_date, description, category, reference, created_by, created_at
       FROM accounting_cashbook_entries
       ORDER BY entry_date DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load cashbook entries:', error)
    return NextResponse.json(
      { error: 'Failed to load cashbook entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entry_type, amount, entry_date, description, category, reference, created_by } = body

    if (!entry_type || !amount || !entry_date || !created_by) {
      return NextResponse.json(
        { error: 'entry_type, amount, entry_date and created_by are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO accounting_cashbook_entries
        (entry_type, amount, entry_date, description, category, reference, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, entry_type, amount, entry_date, description, category, reference, created_by, created_at`,
      [entry_type, amount, entry_date, description || null, category || null, reference || null, created_by]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create cashbook entry:', error)
    return NextResponse.json(
      { error: 'Failed to create cashbook entry' },
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

    await query('DELETE FROM accounting_cashbook_entries WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete cashbook entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete cashbook entry' },
      { status: 500 }
    )
  }
}
