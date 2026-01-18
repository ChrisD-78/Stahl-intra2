import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await request.json().catch(() => ({}))

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Benutzer wurde erfolgreich gelöscht'
    })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Benutzers' },
      { status: 500 }
    )
  }
}
