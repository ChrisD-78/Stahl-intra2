import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET all tasks
export async function GET() {
  try {
    const result = await query(
      'SELECT id, title, description, priority, status, due_date as "due_date", assigned_to as "assigned_to", created_at FROM tasks ORDER BY created_at DESC'
    )
    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error?.message },
      { status: 500 }
    )
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/tasks - Request received')
    const body = await request.json()
    console.log('POST /api/tasks - Body:', body)
    const { title, description, priority, status, due_date, assigned_to } = body

    if (!title || !assigned_to) {
      console.error('POST /api/tasks - Missing required fields')
      return NextResponse.json(
        { error: 'Title and assigned_to are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO tasks (title, description, priority, status, due_date, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, description, priority, status, due_date as "due_date", assigned_to as "assigned_to", created_at`,
      [
        title,
        description || '',
        priority || 'Normal',
        status || 'Offen',
        due_date || new Date().toISOString().split('T')[0],
        assigned_to
      ]
    )

    console.log('POST /api/tasks - Task created:', result.rows[0])
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    console.error('POST /api/tasks - Error:', error)
    console.error('POST /api/tasks - Error details:', {
      message: error?.message,
      stack: error?.stack
    })
    return NextResponse.json(
      { error: 'Failed to create task', details: error?.message },
      { status: 500 }
    )
  }
}

// DELETE task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task', details: error?.message },
      { status: 500 }
    )
  }
}
