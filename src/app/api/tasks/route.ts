import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET all tasks
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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

    // Mock-Daten zurückgeben (später durch echte Datenbank ersetzen)
    const mockResult = {
      id: Date.now().toString(),
      title,
      description: description || '',
      priority: priority || 'Mittel',
      status: status || 'Offen',
      due_date: due_date || new Date().toISOString().split('T')[0],
      assigned_to,
      created_at: new Date().toISOString()
    }

    console.log('POST /api/tasks - Returning result:', mockResult)
    return NextResponse.json(mockResult, { status: 201 })
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

    // Mock-Löschung (später durch echte Datenbank ersetzen)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
