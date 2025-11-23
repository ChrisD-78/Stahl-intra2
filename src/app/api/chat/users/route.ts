import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNGEN DEAKTIVIERT - Mock-Implementierung
// GET all chat users
export async function GET() {
  try {
    // Mock: Leeres Array zurückgeben
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch chat users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat users' },
      { status: 500 }
    )
  }
}

// POST create or update chat user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, avatar } = body

    // Mock: Dummy-Daten zurückgeben
    const mockResult = {
      id,
      name,
      avatar: avatar || null,
      is_online: true,
      updated_at: new Date().toISOString()
    }
    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to upsert chat user:', error)
    return NextResponse.json(
      { error: 'Failed to upsert chat user' },
      { status: 500 }
    )
  }
}
