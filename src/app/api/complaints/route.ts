import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all complaints
export async function GET() {
  try {
    const result = await query(
      `SELECT 
        id, 
        title, 
        description, 
        category, 
        area, 
        submitted_by as "submittedBy",
        submitted_at as "submittedAt",
        assigned_to as "assignedTo",
        status,
        response_method as "responseMethod",
        response_date as "responseDate",
        response_by as "responseBy",
        response_text as "responseText",
        resolution,
        resolved_at as "resolvedAt"
      FROM complaints 
      ORDER BY submitted_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch complaints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch complaints', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new complaint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, area, submittedBy, assignedTo } = body
    
    const result = await query(
      `INSERT INTO complaints (title, description, category, area, submitted_by, assigned_to, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING 
        id, 
        title, 
        description, 
        category, 
        area, 
        submitted_by as "submittedBy",
        submitted_at as "submittedAt",
        assigned_to as "assignedTo",
        status,
        response_method as "responseMethod",
        response_date as "responseDate",
        response_by as "responseBy",
        response_text as "responseText",
        resolution,
        resolved_at as "resolvedAt"`,
      [title, description, category, area, submittedBy, assignedTo || null, assignedTo ? 'Zugewiesen' : 'Neu']
    )
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create complaint:', error)
    return NextResponse.json(
      { error: 'Failed to create complaint', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
