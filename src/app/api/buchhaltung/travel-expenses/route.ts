import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const result = await query(
      `SELECT id, employee_name, start_date, end_date, purpose, kilometers, mileage_rate, meals, lodging, other_costs,
              total_amount, status, created_by, created_at, updated_at
       FROM accounting_travel_expenses
       ${status ? 'WHERE status = $1' : ''}
       ORDER BY created_at DESC`,
      status ? [status] : []
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load travel expenses:', error)
    return NextResponse.json(
      { error: 'Failed to load travel expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee_name,
      start_date,
      end_date,
      purpose,
      kilometers,
      mileage_rate,
      meals,
      lodging,
      other_costs,
      total_amount,
      status,
      created_by
    } = body

    if (!employee_name || !created_by) {
      return NextResponse.json(
        { error: 'employee_name and created_by are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO accounting_travel_expenses
        (employee_name, start_date, end_date, purpose, kilometers, mileage_rate, meals, lodging, other_costs,
         total_amount, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, employee_name, start_date, end_date, purpose, kilometers, mileage_rate, meals, lodging, other_costs,
                 total_amount, status, created_by, created_at, updated_at`,
      [
        employee_name,
        start_date || null,
        end_date || null,
        purpose || null,
        kilometers ?? null,
        mileage_rate ?? null,
        meals ?? null,
        lodging ?? null,
        other_costs ?? null,
        total_amount ?? null,
        status || 'eingereicht',
        created_by
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create travel expense:', error)
    return NextResponse.json(
      { error: 'Failed to create travel expense' },
      { status: 500 }
    )
  }
}
