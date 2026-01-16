import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all campaigns
export async function GET() {
  try {
    const result = await query(
      `SELECT 
        id, 
        title, 
        description, 
        start_date as "startDate",
        end_date as "endDate",
        status,
        types,
        location,
        responsible,
        materials,
        created_at as "createdAt"
      FROM marketing_campaigns 
      ORDER BY start_date DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, startDate, endDate, types, location, responsible, materials } = body
    
    const result = await query(
      `INSERT INTO marketing_campaigns (title, description, start_date, end_date, types, location, responsible, materials) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING 
        id, 
        title, 
        description, 
        start_date as "startDate",
        end_date as "endDate",
        status,
        types,
        location,
        responsible,
        materials,
        created_at as "createdAt"`,
      [title, description, startDate, endDate, types || [], location, responsible, materials || []]
    )
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
