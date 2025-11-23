import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNGEN DEAKTIVIERT - Mock-Implementierung
// POST mark recurring task as completed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { completedBy, notes } = body

    // Mock: Dummy-Daten zurückgeben
    const now = new Date()
    const nextDueDate = new Date(now)
    nextDueDate.setDate(now.getDate() + 1)
    
    const mockCompletion = {
      id: Date.now().toString(),
      recurring_task_id: id,
      completed_by: completedBy,
      notes: notes || '',
      next_due_date: nextDueDate.toISOString(),
      completed_at: now.toISOString()
    }

    return NextResponse.json(mockCompletion, { status: 201 })
  } catch (error) {
    console.error('Failed to mark task as completed:', error)
    return NextResponse.json(
      { error: 'Failed to mark task as completed' },
      { status: 500 }
    )
  }
}
