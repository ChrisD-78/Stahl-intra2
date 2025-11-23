import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNGEN DEAKTIVIERT - Mock-Implementierung
// PATCH update recurring task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    // Mock: Dummy-Daten zurückgeben
    const { title, description, frequency, priority, start_time, assigned_to, is_active, next_due } = body
    const mockResult = {
      id,
      title: title || 'Mock Task',
      description: description || '',
      frequency: frequency || 'Täglich',
      priority: priority || 'Mittel',
      start_time: start_time || '09:00',
      assigned_to: assigned_to || null,
      is_active: is_active !== undefined ? is_active : true,
      next_due: next_due || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return NextResponse.json(mockResult)
  } catch (error) {
    console.error('Failed to update recurring task:', error)
    return NextResponse.json(
      { error: 'Failed to update recurring task' },
      { status: 500 }
    )
  }
}
