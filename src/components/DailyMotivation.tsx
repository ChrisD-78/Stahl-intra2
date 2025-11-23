'use client'

import { useState, useEffect } from 'react'

const DailyMotivation = () => {
  const [quote, setQuote] = useState('')

  const motivationalQuotes = [
    {
      quote: 'Jede Freigabe und jedes Formular ist ein Baustein für das Vertrauen in unsere Verwaltung.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Akten können schwer sein – euer Einsatz macht sie leicht für alle anderen.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Wer Prozesse sortiert, schenkt den Kolleginnen und Kollegen wertvolle Zeit.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Zahlen, Fristen, Nachweise: Ihr haltet alles zusammen, damit Projekte wachsen können.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Verlässlichkeit ist eure Superkraft – dank euch bleibt Verwaltung planbar.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Eure Sorgfalt verwandelt Paragraphen in praktikable Lösungen für den Alltag.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Jede freundlich beantwortete Rückfrage stärkt das Vertrauen in unseren Service.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Perfekte Verwaltung ist unsichtbar – bis etwas fehlt. Gut, dass ihr da seid.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Ihr seid die Navigatoren durch Richtlinien, Budgetzahlen und Genehmigungen.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Mit jeder sauber dokumentierten Entscheidung wächst Transparenz für die Stadt.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Teamwork in der Verwaltung bedeutet: niemand steht mit seinem Vorgang alleine da.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Eure Geduld im Verwaltungsalltag ist der Leuchtturm in komplexen Situationen.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Wer Unterlagen sortiert, schafft Orientierung – und damit Vertrauen.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Jeder genehmigte Antrag zeigt: Verwaltung kann beschleunigen, wenn Profis dran sind.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Ihr bringt Struktur in Ideen – so wird Veränderung verlässlich.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Euer Verständnis für Regeln schützt Projekte, Budgets und Menschen gleichermaßen.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Verwaltung ist kein Papierkrieg, sondern ein Dienst an allen – genau das lebt ihr.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Wer heute sauber dokumentiert, erspart morgen Diskussionen – danke für euren Blick fürs Detail.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Ihr sorgt dafür, dass Entscheidungen nachvollziehbar bleiben – das ist echte Wertschätzung.',
      author: 'Verwaltungsteam'
    },
    {
      quote: 'Transparente Prozesse beginnen mit eurem Engagement.',
      author: 'Verwaltungsteam'
    }
  ]

  useEffect(() => {
    // Berechne den Index basierend auf dem aktuellen Datum
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    
    // Verwende den Tag des Jahres, um den Spruch zu wählen
    const quoteIndex = dayOfYear % motivationalQuotes.length
    setQuote(motivationalQuotes[quoteIndex].quote)
  }, [])

  if (!quote) return null

  return (
    <div className="mt-6 p-6 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
      <div className="text-center">
        <div className="mb-3">
          <span className="text-2xl">💫</span>
          <span className="text-lg text-white/90 ml-2">Spruch des Tages</span>
          <span className="text-2xl ml-2">💫</span>
        </div>
        <blockquote className="text-xl text-white font-medium italic leading-relaxed mb-3">
          &quot;{quote}&quot;
        </blockquote>
      </div>
    </div>
  )
}

export default DailyMotivation
