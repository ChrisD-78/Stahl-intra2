import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Benutzername und Passwort erforderlich' },
        { status: 400 }
      )
    }

    const result = await query(
      `SELECT id, username, password, display_name, is_admin, role, is_active
       FROM users
       WHERE username = $1
       LIMIT 1`,
      [username]
    )

    const user = result.rows[0]

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Benutzerkonto ist deaktiviert' },
        { status: 403 }
      )
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        isAdmin: user.is_admin,
        role: user.role || 'Benutzer'
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Serverfehler beim Login' },
      { status: 500 }
    )
  }
}
