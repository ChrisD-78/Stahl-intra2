import { NextRequest, NextResponse } from 'next/server'
// #region agent log
import { query } from '@/lib/database'
import { writeFileSync, appendFileSync } from 'fs'
import { join } from 'path'

const logPath = join(process.cwd(), '.cursor', 'debug.log')
function logServer(location: string, message: string, data: any, hypothesisId: string) {
  try {
    const logEntry = JSON.stringify({location,message,data,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId}) + '\n'
    appendFileSync(logPath, logEntry, 'utf8')
  } catch (e) {}
}

// #endregion
// GET all dashboard infos
export async function GET() {
  // #region agent log
  logServer('api/dashboard-infos/route.ts:GET:entry', 'GET dashboard infos called', {}, 'A')
  // #endregion
  try {
    // #region agent log
    logServer('api/dashboard-infos/route.ts:GET:before-query', 'Before database query', {hasDatabaseUrl:!!process.env.DATABASE_URL}, 'A')
    // #endregion
    const result = await query(
      'SELECT id, title, content, timestamp, pdf_name, pdf_url, is_popup, created_at FROM dashboard_infos ORDER BY created_at DESC'
    )
    // #region agent log
    logServer('api/dashboard-infos/route.ts:GET:after-query', 'After database query', {rowCount:result.rowCount}, 'A')
    // #endregion
    return NextResponse.json(result.rows)
  } catch (error) {
    // #region agent log
    logServer('api/dashboard-infos/route.ts:GET:error', 'GET error occurred', {error:String(error),errorMessage:error instanceof Error ? error.message : 'unknown'}, 'B')
    // #endregion
    console.error('Failed to fetch dashboard infos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard infos', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST create new dashboard info
export async function POST(request: NextRequest) {
  // #region agent log
  logServer('api/dashboard-infos/route.ts:POST:entry', 'POST create dashboard info called', {}, 'C')
  // #endregion
  try {
    const body = await request.json()
    // #region agent log
    logServer('api/dashboard-infos/route.ts:POST:body-parsed', 'Request body parsed', {title:body.title,hasContent:!!body.content,hasPdf:!!body.pdf_url,hasDatabaseUrl:!!process.env.DATABASE_URL}, 'C')
    // #endregion
    const { title, content, timestamp, pdf_name, pdf_url, is_popup } = body
    
    // #region agent log
    logServer('api/dashboard-infos/route.ts:POST:before-insert', 'Before database insert', {title,contentLength:content?.length,timestamp,pdf_name,pdf_url,is_popup}, 'D')
    // #endregion
    const result = await query(
      `INSERT INTO dashboard_infos (title, content, timestamp, pdf_name, pdf_url, is_popup) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, title, content, timestamp, pdf_name, pdf_url, is_popup, created_at`,
      [title, content, timestamp, pdf_name || null, pdf_url || null, is_popup || false]
    )
    // #region agent log
    logServer('api/dashboard-infos/route.ts:POST:after-insert', 'After database insert', {rowCount:result.rowCount,insertedId:result.rows[0]?.id}, 'D')
    // #endregion
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    // #region agent log
    logServer('api/dashboard-infos/route.ts:POST:error', 'POST error occurred', {error:String(error),errorMessage:error instanceof Error ? error.message : 'unknown',errorStack:error instanceof Error ? error.stack : 'no stack'}, 'B')
    // #endregion
    console.error('Failed to create dashboard info:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard info', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE dashboard info
export async function DELETE(request: NextRequest) {
  // #region agent log
  logServer('api/dashboard-infos/route.ts:DELETE:entry', 'DELETE dashboard info called', {}, 'A')
  // #endregion
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // #region agent log
    logServer('api/dashboard-infos/route.ts:DELETE:before-delete', 'Before database delete', {id}, 'A')
    // #endregion
    await query('DELETE FROM dashboard_infos WHERE id = $1', [id])
    // #region agent log
    logServer('api/dashboard-infos/route.ts:DELETE:after-delete', 'After database delete', {id}, 'A')
    // #endregion
    return NextResponse.json({ success: true })
  } catch (error) {
    // #region agent log
    logServer('api/dashboard-infos/route.ts:DELETE:error', 'DELETE error occurred', {error:String(error),errorMessage:error instanceof Error ? error.message : 'unknown'}, 'B')
    // #endregion
    console.error('Failed to delete dashboard info:', error)
    return NextResponse.json(
      { error: 'Failed to delete dashboard info' },
      { status: 500 }
    )
  }
}
