import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all documents (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')

    let sql = 'SELECT id, title, description, category, file_name, file_size_mb, file_type, tags, uploaded_at, uploaded_by, file_url FROM documents'
    const params: any[] = []
    const conditions: string[] = []

    if (category) {
      conditions.push(`category = $${params.length + 1}`)
      params.push(category)
    }

    if (tags) {
      const tagArray = tags.split(',')
      conditions.push(`tags && $${params.length + 1}`)
      params.push(tagArray)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY uploaded_at DESC'

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, file_name, file_size_mb, file_type, tags, uploaded_by, file_url } = body
    
    const result = await query(
      `INSERT INTO documents (title, description, category, file_name, file_size_mb, file_type, tags, uploaded_by, file_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, title, description, category, file_name, file_size_mb, file_type, tags, uploaded_at, uploaded_by, file_url`,
      [title, description, category, file_name, file_size_mb, file_type, tags || [], uploaded_by, file_url || null]
    )
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json(
      { error: 'Failed to create document', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await query('DELETE FROM documents WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
