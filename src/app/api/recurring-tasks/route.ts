import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNGEN DEAKTIVIERT - Mock-Implementierung

// GET all recurring tasks
export async function GET() {
  try {
    // Mock: Leeres Array zurückgeben
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch recurring tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring tasks' },
      { status: 500 }
    )
  }
}

// POST create new recurring task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, frequency, priority, start_time, assigned_to, is_active, next_due } = body

    // Mock: Dummy-Daten zurückgeben
    const mockResult = {
      id: Date.now().toString(),
      title,
      description,
      frequency,
      priority,
      start_time,
      assigned_to,
      is_active,
      next_due,
      created_at: new Date().toISOString()
    }
    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to create recurring task:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring task', details: error },
      { status: 500 }
    )
  }
}

// DELETE recurring task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Mock: Erfolg zurückgeben
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete recurring task:', error)
    return NextResponse.json(
      { error: 'Failed to delete recurring task' },
      { status: 500 }
    )
  }
}
