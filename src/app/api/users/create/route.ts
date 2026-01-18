import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { username, password, displayName, role, createdBy } = await request.json()

    if (!username || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Benutzername, Passwort und Anzeigename sind erforderlich' },
        { status: 400 }
      )
    }

    if (password.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Passwort muss mindestens 5 Zeichen lang sein' },
        { status: 400 }
      )
    }

    const validRoles = ['Admin', 'Personal', 'Buchhaltung', 'Verwaltung', 'Benutzer']
    const userRole = role && validRoles.includes(role) ? role : 'Benutzer'
    const isAdmin = userRole === 'Admin'

    const result = await query(
      `INSERT INTO users (username, password, display_name, is_admin, role, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, display_name, is_admin, role, is_active, created_at, created_by`,
      [username, password, displayName, isAdmin, userRole, true, createdBy || null]
    )

    const created = result.rows[0]

    return NextResponse.json({
      success: true,
      user: {
        id: created.id,
        username: created.username,
        displayName: created.display_name,
        role: created.role,
        isAdmin: created.is_admin,
        isActive: created.is_active,
        createdAt: created.created_at
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create user:', error)
    const message = error?.code === '23505'
      ? 'Benutzername existiert bereits'
      : 'Fehler beim Erstellen des Benutzers'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
