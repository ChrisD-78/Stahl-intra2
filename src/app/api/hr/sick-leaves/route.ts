import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const result = await query(
      `SELECT id, employee_name, department, start_date, end_date, reason, status, au_file_name, au_file_url,
              submitted_by, created_at, updated_at
       FROM hr_sick_leaves
       ${status ? 'WHERE status = $1' : ''}
       ORDER BY created_at DESC`,
      status ? [status] : []
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load sick leaves:', error)
    return NextResponse.json({ error: 'Failed to load sick leaves' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee_name,
      department,
      start_date,
      end_date,
      reason,
      status,
      au_file_name,
      au_file_url,
      submitted_by
    } = body

    if (!employee_name || !start_date || !submitted_by) {
      return NextResponse.json(
        { error: 'employee_name, start_date and submitted_by are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO hr_sick_leaves
        (employee_name, department, start_date, end_date, reason, status, au_file_name, au_file_url, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, employee_name, department, start_date, end_date, reason, status, au_file_name, au_file_url,
                 submitted_by, created_at, updated_at`,
      [
        employee_name,
        department || null,
        start_date,
        end_date || null,
        reason || null,
        status || 'eingereicht',
        au_file_name || null,
        au_file_url || null,
        submitted_by
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create sick leave:', error)
    return NextResponse.json({ error: 'Failed to create sick leave' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await query('DELETE FROM hr_sick_leaves WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete sick leave:', error)
    return NextResponse.json({ error: 'Failed to delete sick leave' }, { status: 500 })
  }
}
