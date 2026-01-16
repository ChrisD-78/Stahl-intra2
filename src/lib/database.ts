import { Pool } from 'pg'

// Erstelle einen Connection Pool für bessere Performance
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      console.error('DATABASE_URL is missing. Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
      throw new Error('DATABASE_URL environment variable is not set')
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20, // Maximale Anzahl von Verbindungen im Pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Fehlerbehandlung für den Pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  return pool
}

// Hilfsfunktion für Datenbankabfragen
export async function query(text: string, params?: any[]) {
  const pool = getPool()
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error', { text, error })
    throw error
  }
}

// Hilfsfunktion für Transaktionen
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Verbindung schließen (für Cleanup)
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
