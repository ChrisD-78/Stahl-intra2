import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all complaint users
export async function GET() {
  try {
    const result = await query(
      `SELECT id, name, email FROM complaint_users ORDER BY name`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch complaint users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch complaint users', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new complaint user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body
    
    const result = await query(
      `INSERT INTO complaint_users (name, email) 
       VALUES ($1, $2) 
       RETURNING id, name, email`,
      [name, email]
    )
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create complaint user:', error)
    return NextResponse.json(
      { error: 'Failed to create complaint user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE complaint user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await query('DELETE FROM complaint_users WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete complaint user:', error)
    return NextResponse.json(
      { error: 'Failed to delete complaint user' },
      { status: 500 }
    )
  }
}
