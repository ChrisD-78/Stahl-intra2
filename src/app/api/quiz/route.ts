import { NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET all quizzes
export async function GET() {
  try {
    // Mock-Daten (später durch echte Datenbank ersetzen)
    const mockQuizzes = [
      {
        id: 'sauna-quiz',
        title: 'Sauna-Quiz',
        description: 'Wissensquiz über Sauna, Gesundheit und Wellness',
        category: 'Gesundheit & Wellness',
        total_questions: 24,
        passing_score: 70,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: 'System'
      },
      {
        id: 'landau-quiz',
        title: 'Landau in der Pfalz Quiz',
        description: 'Wissensquiz über die Geschichte und Geografie von Landau in der Pfalz',
        category: 'Geschichte & Geografie',
        total_questions: 20,
        passing_score: 70,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: 'System'
      }
    ]
    return NextResponse.json(mockQuizzes)
  } catch (error) {
    console.error('Failed to fetch quizzes:', error)
    return NextResponse.json([])
  }
}

