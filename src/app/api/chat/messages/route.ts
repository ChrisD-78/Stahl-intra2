import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNGEN DEAKTIVIERT - Mock-Implementierung

// GET messages (direct or group)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user1 = searchParams.get('user1')
    const user2 = searchParams.get('user2')
    const groupId = searchParams.get('groupId')

    let messages

    // Mock: Leeres Array zurückgeben
    messages = []
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST send new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender_id, recipient_id, group_id, content, image_url, image_name } = body

    // Mock: Dummy-Daten zurückgeben
    const mockResult = {
      id: Date.now().toString(),
      sender_id,
      recipient_id: recipient_id || null,
      group_id: group_id || null,
      content,
      image_url: image_url || null,
      image_name: image_name || null,
      created_at: new Date().toISOString(),
      is_read: false
    }
    return NextResponse.json(mockResult, { status: 201 })
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PATCH update message (mark as read)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, isRead } = body

    // Mock: Dummy-Daten zurückgeben
    const mockResult = {
      id: messageId,
      is_read: isRead
    }
    return NextResponse.json(mockResult)
  } catch (error) {
    console.error('Failed to update message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}
