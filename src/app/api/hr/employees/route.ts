import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, email, phone, department, position, birthday,
              emergency_contact, emergency_phone, status, created_at, updated_at
       FROM hr_employees
       ORDER BY last_name ASC, first_name ASC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load employees:', error)
    return NextResponse.json({ error: 'Failed to load employees' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      first_name,
      last_name,
      email,
      phone,
      department,
      position,
      birthday,
      emergency_contact,
      emergency_phone,
      status
    } = body

    if (!first_name || !last_name) {
      return NextResponse.json({ error: 'first_name and last_name are required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO hr_employees
        (first_name, last_name, email, phone, department, position, birthday, emergency_contact, emergency_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, first_name, last_name, email, phone, department, position, birthday,
                 emergency_contact, emergency_phone, status, created_at, updated_at`,
      [
        first_name,
        last_name,
        email || null,
        phone || null,
        department || null,
        position || null,
        birthday || null,
        emergency_contact || null,
        emergency_phone || null,
        status || 'aktiv'
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create employee:', error)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await query('DELETE FROM hr_employees WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete employee:', error)
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}
