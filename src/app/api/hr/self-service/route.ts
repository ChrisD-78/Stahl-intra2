import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const result = await query(
      `SELECT id, employee_name, request_type, details, status, created_by, created_at, updated_at
       FROM hr_self_service_requests
       ${status ? 'WHERE status = $1' : ''}
       ORDER BY created_at DESC`,
      status ? [status] : []
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load self-service requests:', error)
    return NextResponse.json({ error: 'Failed to load self-service requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_name, request_type, details, status, created_by } = body

    if (!employee_name || !request_type || !created_by) {
      return NextResponse.json(
        { error: 'employee_name, request_type and created_by are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO hr_self_service_requests
        (employee_name, request_type, details, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, employee_name, request_type, details, status, created_by, created_at, updated_at`,
      [employee_name, request_type, details || null, status || 'eingereicht', created_by]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create self-service request:', error)
    return NextResponse.json({ error: 'Failed to create self-service request' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await query('DELETE FROM hr_self_service_requests WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete self-service request:', error)
    return NextResponse.json({ error: 'Failed to delete self-service request' }, { status: 500 })
  }
}
