import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all texts
export async function GET() {
  try {
    const result = await query(
      `SELECT 
        id, 
        title, 
        content, 
        type,
        created_by as "createdBy",
        created_at as "createdAt",
        status,
        approved_by as "approvedBy",
        approved_at as "approvedAt"
      FROM marketing_texts 
      ORDER BY created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch texts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch texts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new text
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, type, createdBy } = body
    
    const result = await query(
      `INSERT INTO marketing_texts (title, content, type, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING 
        id, 
        title, 
        content, 
        type,
        created_by as "createdBy",
        created_at as "createdAt",
        status,
        approved_by as "approvedBy",
        approved_at as "approvedAt"`,
      [title, content, type, createdBy]
    )
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create text:', error)
    return NextResponse.json(
      { error: 'Failed to create text', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
