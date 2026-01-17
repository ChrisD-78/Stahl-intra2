import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('document_id')

    if (!documentId) {
      return NextResponse.json({ error: 'document_id is required' }, { status: 400 })
    }

    const result = await query(
      `SELECT id, document_id, comment, created_by, created_at
       FROM accounting_document_comments
       WHERE document_id = $1
       ORDER BY created_at DESC`,
      [documentId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to load document comments:', error)
    return NextResponse.json(
      { error: 'Failed to load document comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document_id, comment, created_by } = body

    if (!document_id || !comment || !created_by) {
      return NextResponse.json(
        { error: 'document_id, comment and created_by are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO accounting_document_comments (document_id, comment, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, document_id, comment, created_by, created_at`,
      [document_id, comment, created_by]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create document comment:', error)
    return NextResponse.json(
      { error: 'Failed to create document comment' },
      { status: 500 }
    )
  }
}
