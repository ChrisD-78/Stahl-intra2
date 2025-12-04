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

async function clearChatData() {
  try {
    const sql = neon(process.env.DATABASE_URL)

    console.log('🔄 Lösche alle Chat-Daten...')
    
    // Zähle zuerst, wie viele Einträge vorhanden sind
    const messagesCount = await sql`SELECT COUNT(*) as count FROM chat_messages`
    const usersCount = await sql`SELECT COUNT(*) as count FROM chat_users`
    const groupsCount = await sql`SELECT COUNT(*) as count FROM chat_groups`
    const membersCount = await sql`SELECT COUNT(*) as count FROM chat_group_members`
    
    const totalMessages = messagesCount[0]?.count || 0
    const totalUsers = usersCount[0]?.count || 0
    const totalGroups = groupsCount[0]?.count || 0
    const totalMembers = membersCount[0]?.count || 0
    
    console.log(`📊 Gefunden:`)
    console.log(`   - ${totalMessages} Chat-Nachrichten`)
    console.log(`   - ${totalUsers} Chat-Benutzer`)
    console.log(`   - ${totalGroups} Chat-Gruppen`)
    console.log(`   - ${totalMembers} Gruppenmitglieder`)
    
    if (totalMessages === 0 && totalUsers === 0 && totalGroups === 0 && totalMembers === 0) {
      console.log('ℹ️  Keine Chat-Daten zum Löschen vorhanden.')
      process.exit(0)
    }
    
    // Lösche in der richtigen Reihenfolge (wegen Foreign Keys)
    // Zuerst Nachrichten (können auf Gruppen verweisen)
    if (totalMessages > 0) {
      await sql`DELETE FROM chat_messages`
      console.log(`✅ ${totalMessages} Chat-Nachrichten gelöscht`)
    }
    
    // Dann Gruppenmitglieder (verweisen auf Gruppen)
    if (totalMembers > 0) {
      await sql`DELETE FROM chat_group_members`
      console.log(`✅ ${totalMembers} Gruppenmitglieder gelöscht`)
    }
    
    // Dann Gruppen
    if (totalGroups > 0) {
      await sql`DELETE FROM chat_groups`
      console.log(`✅ ${totalGroups} Chat-Gruppen gelöscht`)
    }
    
    // Zuletzt Benutzer
    if (totalUsers > 0) {
      await sql`DELETE FROM chat_users`
      console.log(`✅ ${totalUsers} Chat-Benutzer gelöscht`)
    }
    
    console.log('\n✨ Alle Chat-Daten wurden erfolgreich gelöscht!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Fehler:', error)
    process.exit(1)
  }
}

clearChatData()





