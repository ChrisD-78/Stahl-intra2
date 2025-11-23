import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNGEN DEAKTIVIERT - Mock-Implementierung
// GET all chat groups
export async function GET() {
  try {
    // Mock: Leeres Array zurückgeben
    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch chat groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat groups' },
      { status: 500 }
    )
  }
}

// POST create new chat group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Mock: Dummy-Daten zurückgeben
    const mockResult = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || null,
      created_by: body.created_by,
      created_at: new Date().toISOString()
    }
    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to create chat group:', error)
    return NextResponse.json(
      { error: 'Failed to create chat group' },
      { status: 500 }
    )
  }
}
