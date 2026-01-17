import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

const ALLOWED_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'department',
  'position',
  'birthday',
  'emergency_contact',
  'emergency_phone',
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
      `UPDATE hr_employees
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, first_name, last_name, email, phone, department, position, birthday,
                 emergency_contact, emergency_phone, status, created_at, updated_at`,
      values
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Failed to update employee:', error)
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await query('DELETE FROM hr_employees WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete employee:', error)
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}
