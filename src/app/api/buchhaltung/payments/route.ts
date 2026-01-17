import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const result = await query(
      `SELECT id, document_id, label, amount, due_date, status, paid_at, method, created_at, updated_at
       FROM accounting_payments
       ${status ? 'WHERE status = $1' : ''}
       ORDER BY due_date ASC`,
      status ? [status] : []
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load payments:', error)
    return NextResponse.json(
      { error: 'Failed to load payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document_id, label, amount, due_date, status, paid_at, method } = body

    if (!label || !amount) {
      return NextResponse.json(
        { error: 'label and amount are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO accounting_payments
        (document_id, label, amount, due_date, status, paid_at, method)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, document_id, label, amount, due_date, status, paid_at, method, created_at, updated_at`,
      [
        document_id || null,
        label,
        amount,
        due_date || null,
        status || 'geplant',
        paid_at || null,
        method || null
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
