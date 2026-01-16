import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all dashboard infos
export async function GET() {
  try {
    const result = await query(
      'SELECT id, title, content, timestamp, pdf_name, pdf_url, is_popup, created_at FROM dashboard_infos ORDER BY created_at DESC'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch dashboard infos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard infos', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new dashboard info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, timestamp, pdf_name, pdf_url, is_popup } = body
    
    const result = await query(
      `INSERT INTO dashboard_infos (title, content, timestamp, pdf_name, pdf_url, is_popup) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, title, content, timestamp, pdf_name, pdf_url, is_popup, created_at`,
      [title, content, timestamp, pdf_name || null, pdf_url || null, is_popup || false]
    )
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create dashboard info:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard info', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE dashboard info
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await query('DELETE FROM dashboard_infos WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete dashboard info:', error)
    return NextResponse.json(
      { error: 'Failed to delete dashboard info' },
      { status: 500 }
    )
  }
}
