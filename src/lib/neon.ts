// DATENBANKVERBINDUNGEN DEAKTIVIERT
// Diese Datei wurde deaktiviert, da es sich um eine Kopie handelt
// und später eine neue Datenbank erstellt werden wird.

// import { neon } from '@neondatabase/serverless'
// const sql = neon(process.env.DATABASE_URL!)
// export { sql }

// Mock SQL-Objekt für Kompatibilität
export const sql = {
  async query() {
    return []
  }
} as any
