const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Lade .env.local falls vorhanden
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

async function resetUsers() {
  try {
    const connectionString = process.env.STAHO_DATABASE_URL || process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('STAHO_DATABASE_URL or DATABASE_URL is not set')
    }
    const sql = neon(connectionString)

    console.log('🔄 Lösche alle bestehenden Nutzer...')
    
    // Lösche alle Nutzer
    await sql`DELETE FROM users`
    
    console.log('✅ Alle Nutzer wurden gelöscht')
    
    console.log('🔄 Erstelle neuen Nutzer "staho"...')
    
    // Erstelle neuen Nutzer
    const result = await sql`
      INSERT INTO users (
        username,
        password,
        display_name,
        role,
        is_admin,
        is_active
      ) VALUES (
        'staho',
        'staho1',
        'Stadtholding',
        'Admin',
        true,
        true
      )
      RETURNING id, username, display_name, role, is_admin
    `
    
    const newUser = result[0]
    console.log('✅ Neuer Nutzer erstellt:')
    console.log(`   Username: ${newUser.username}`)
    console.log(`   Passwort: staho1`)
    console.log(`   Display Name: ${newUser.display_name}`)
    console.log(`   Rolle: ${newUser.role}`)
    console.log(`   Admin: ${newUser.is_admin}`)
    
    console.log('\n✨ Fertig! Sie können sich jetzt mit folgenden Daten anmelden:')
    console.log('   Username: staho')
    console.log('   Passwort: staho1')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Fehler:', error)
    process.exit(1)
  }
}

resetUsers()

