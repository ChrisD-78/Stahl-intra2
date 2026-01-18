import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, username, display_name, is_admin, role, is_active, created_at, last_login, created_by
       FROM users
       ORDER BY created_at DESC`
    )

    return NextResponse.json({
      success: true,
      users: result.rows
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Benutzer' },
      { status: 500 }
    )
  }
}
