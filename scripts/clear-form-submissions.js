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

async function clearFormSubmissions() {
  try {
    const sql = neon(process.env.DATABASE_URL)

    console.log('🔄 Lösche alle Formulareinreichungen...')
    
    // Zähle zuerst, wie viele Einträge vorhanden sind
    const countResult = await sql`SELECT COUNT(*) as count FROM form_submissions`
    const count = countResult[0]?.count || 0
    
    console.log(`📊 Gefunden: ${count} Formulareinreichung(en)`)
    
    if (count === 0) {
      console.log('ℹ️  Keine Formulareinreichungen zum Löschen vorhanden.')
      process.exit(0)
    }
    
    // Lösche alle Formulareinreichungen
    await sql`DELETE FROM form_submissions`
    
    console.log(`✅ ${count} Formulareinreichung(en) wurden gelöscht`)
    console.log('\n✨ Alle Formulareinreichungen wurden erfolgreich entfernt!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Fehler:', error)
    process.exit(1)
  }
}

clearFormSubmissions()










