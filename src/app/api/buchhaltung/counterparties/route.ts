import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const result = await query(
      `SELECT id, counterparty_type, name, iban, bic, tax_id, email, phone, address, created_at, updated_at
       FROM accounting_counterparties
       ${type ? 'WHERE counterparty_type = $1' : ''}
       ORDER BY name ASC`,
      type ? [type] : []
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load counterparties:', error)
    return NextResponse.json(
      { error: 'Failed to load counterparties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { counterparty_type, name, iban, bic, tax_id, email, phone, address } = body

    if (!counterparty_type || !name) {
      return NextResponse.json(
        { error: 'counterparty_type and name are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO accounting_counterparties
        (counterparty_type, name, iban, bic, tax_id, email, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, counterparty_type, name, iban, bic, tax_id, email, phone, address, created_at, updated_at`,
      [counterparty_type, name, iban || null, bic || null, tax_id || null, email || null, phone || null, address || null]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create counterparty:', error)
    return NextResponse.json(
      { error: 'Failed to create counterparty' },
      { status: 500 }
    )
  }
}
