import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all posters
export async function GET() {
  try {
    const result = await query(
      `SELECT 
        id, 
        title, 
        description, 
        file_url as "fileUrl",
        file_name as "fileName",
        file_size as "fileSize",
        uploaded_by as "uploadedBy",
        uploaded_at as "uploadedAt",
        status,
        approved_by as "approvedBy",
        sent_to as "sentTo",
        sent_at as "sentAt"
      FROM marketing_posters 
      ORDER BY uploaded_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch posters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posters', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new poster
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, fileUrl, fileName, fileSize, uploadedBy } = body
    
    const result = await query(
      `INSERT INTO marketing_posters (title, description, file_url, file_name, file_size, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING 
        id, 
        title, 
        description, 
        file_url as "fileUrl",
        file_name as "fileName",
        file_size as "fileSize",
        uploaded_by as "uploadedBy",
        uploaded_at as "uploadedAt",
        status,
        approved_by as "approvedBy",
        sent_to as "sentTo",
        sent_at as "sentAt"`,
      [title, description, fileUrl, fileName, fileSize, uploadedBy]
    )
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create poster:', error)
    return NextResponse.json(
      { error: 'Failed to create poster', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
