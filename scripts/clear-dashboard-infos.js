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

async function clearDashboardInfos() {
  try {
    const sql = neon(process.env.DATABASE_URL)

    console.log('🔄 Lösche alle Dashboard-Informationen...')
    
    // Zähle zuerst, wie viele Einträge vorhanden sind
    const countResult = await sql`SELECT COUNT(*) as count FROM dashboard_infos`
    const count = countResult[0]?.count || 0
    
    console.log(`📊 Gefunden: ${count} Einträge`)
    
    if (count === 0) {
      console.log('ℹ️  Keine Einträge zum Löschen vorhanden.')
      process.exit(0)
    }
    
    // Lösche alle Dashboard-Infos
    await sql`DELETE FROM dashboard_infos`
    
    console.log(`✅ ${count} Dashboard-Information(en) wurden gelöscht`)
    console.log('\n✨ Sie können jetzt neue Informationen eingeben!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Fehler:', error)
    process.exit(1)
  }
}

clearDashboardInfos()








