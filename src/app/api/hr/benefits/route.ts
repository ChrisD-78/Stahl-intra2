import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, title, description, category, is_active, created_by, created_at, updated_at
       FROM hr_benefits
       ORDER BY created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load benefits:', error)
    return NextResponse.json({ error: 'Failed to load benefits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, is_active, created_by } = body

    if (!title || !created_by) {
      return NextResponse.json({ error: 'title and created_by are required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO hr_benefits
        (title, description, category, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, category, is_active, created_by, created_at, updated_at`,
      [title, description || null, category || null, is_active ?? true, created_by]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create benefit:', error)
    return NextResponse.json({ error: 'Failed to create benefit' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await query('DELETE FROM hr_benefits WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete benefit:', error)
    return NextResponse.json({ error: 'Failed to delete benefit' }, { status: 500 })
  }
}
