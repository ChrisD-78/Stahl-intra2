'use client'

import { useState, useEffect, useRef } from 'react'
import { useTasks } from '@/contexts/TaskContext'
import { uploadInfoPdf } from '@/lib/db'

interface JourFixeEntry {
  id: string
  bereich: string
  kategorie: string
  vereinbartAm: string
  aufgabenfeld: string
  klaerung: string
  verantwortlich: string
  beteiligt: string
  terminSoll: string
  abschlussTermin: string
  prioritaet: 'Niedrig' | 'Mittel' | 'Hoch'
  status: 'warte' | 'in Arbeit' | 'erledigt'
  createdAt: string
  pdfUrl?: string
  pdfName?: string
}

const mockBereiche = ['FZB', 'FB', 'FH', 'AK', 'BL Jour Fixe']
const mockKategorien = ['Energie', 'Allgemein']
const mockUsers = ['Drost', 'Klement', 'Hartmann', 'Müller', 'Schmidt', 'Weber']
const mockPrioritaeten: JourFixeEntry['prioritaet'][] = ['Niedrig', 'Mittel', 'Hoch']
const mockStatus: JourFixeEntry['status'][] = ['warte', 'in Arbeit', 'erledigt']

export default function Aufgaben() {
  const { addTask, tasks } = useTasks()
  const [entries, setEntries] = useState<JourFixeEntry[]>([])

  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JourFixeEntry | null>(null)
  const [filterBereich, setFilterBereich] = useState<string>('')
  const [filterKategorie, setFilterKategorie] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'today' | 'open' | 'completed'>('all')
  const [entriesProcessed, setEntriesProcessed] = useState<Set<string>>(new Set())
  const [initialized, setInitialized] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [pdfFilters, setPdfFilters] = useState({
    bereich: [] as string[],
    status: [] as string[],
    dateFrom: '',
    dateTo: ''
  })
  const [emailAddress, setEmailAddress] = useState('')

  const [formData, setFormData] = useState<Omit<JourFixeEntry, 'id' | 'createdAt'>>({
    bereich: '',
    kategorie: '',
    vereinbartAm: '',
    aufgabenfeld: '',
    klaerung: '',
    verantwortlich: '',
    beteiligt: '',
    terminSoll: '',
    abschlussTermin: '',
    prioritaet: 'Mittel',
    status: 'warte',
    pdfUrl: '',
    pdfName: ''
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hilfsfunktionen für Jour-fixe-Einträge
  const isOverdue = (terminSoll: string, status: JourFixeEntry['status']) => {
    if (status === 'erledigt' || !terminSoll) return false
    try {
      const due = new Date(terminSoll)
      const now = new Date()
      return due < now
    } catch {
      return false
    }
  }

  const isDueToday = (terminSoll: string, status: JourFixeEntry['status']) => {
    if (status === 'erledigt' || !terminSoll) return false
    try {
      const due = new Date(terminSoll)
            const now = new Date()
            const diffTime = due.getTime() - now.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays === 0
    } catch {
      return false
    }
  }

  const handleFilterClick = (filter: 'all' | 'overdue' | 'today' | 'open' | 'completed') => {
    // Toggle-Funktion: Wenn der gleiche Filter nochmal geklickt wird, zurück zu 'all'
    if (activeFilter === filter && filter !== 'all') {
      setActiveFilter('all')
    } else {
      setActiveFilter(filter)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Wenn bereits nach dieser Spalte sortiert, Richtung umkehren
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Neue Spalte, aufsteigend sortieren
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredEntries = entries.filter(entry => {
    const matchesBereich = !filterBereich || entry.bereich === filterBereich
    const matchesKategorie = !filterKategorie || entry.kategorie === filterKategorie
    const matchesStatus = !filterStatus || entry.status === filterStatus
    
    // Zusätzliche Filterung basierend auf activeFilter
    let matchesActiveFilter = true
    if (activeFilter === 'overdue') {
      matchesActiveFilter = isOverdue(entry.terminSoll, entry.status)
    } else if (activeFilter === 'today') {
      matchesActiveFilter = isDueToday(entry.terminSoll, entry.status)
    } else if (activeFilter === 'open') {
      matchesActiveFilter = entry.status === 'warte'
    } else if (activeFilter === 'completed') {
      matchesActiveFilter = entry.status === 'erledigt'
    }
    
    return matchesBereich && matchesKategorie && matchesStatus && matchesActiveFilter
  })

  // Sortierung anwenden
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (!sortColumn) return 0

    let aValue: any
    let bValue: any

    switch (sortColumn) {
      case 'bereich':
        aValue = a.bereich
        bValue = b.bereich
        break
      case 'kategorie':
        aValue = a.kategorie
        bValue = b.kategorie
        break
      case 'vereinbartAm':
        aValue = a.vereinbartAm ? new Date(a.vereinbartAm).getTime() : 0
        bValue = b.vereinbartAm ? new Date(b.vereinbartAm).getTime() : 0
        break
      case 'aufgabenfeld':
        aValue = a.aufgabenfeld.toLowerCase()
        bValue = b.aufgabenfeld.toLowerCase()
        break
      case 'klaerung':
        aValue = a.klaerung.toLowerCase()
        bValue = b.klaerung.toLowerCase()
        break
      case 'verantwortlich':
        aValue = a.verantwortlich.toLowerCase()
        bValue = b.verantwortlich.toLowerCase()
        break
      case 'beteiligt':
        aValue = (a.beteiligt || '').toLowerCase()
        bValue = (b.beteiligt || '').toLowerCase()
        break
      case 'terminSoll':
        aValue = a.terminSoll ? new Date(a.terminSoll).getTime() : 0
        bValue = b.terminSoll ? new Date(b.terminSoll).getTime() : 0
        break
      case 'abschlussTermin':
        aValue = a.abschlussTermin ? new Date(a.abschlussTermin).getTime() : 0
        bValue = b.abschlussTermin ? new Date(b.abschlussTermin).getTime() : 0
        break
      case 'prioritaet':
        const priorityOrder = { 'Hoch': 3, 'Mittel': 2, 'Niedrig': 1 }
        aValue = priorityOrder[a.prioritaet] || 0
        bValue = priorityOrder[b.prioritaet] || 0
        break
      case 'status':
        const statusOrder = { 'warte': 1, 'in Arbeit': 2, 'erledigt': 3 }
        aValue = statusOrder[a.status] || 0
        bValue = statusOrder[b.status] || 0
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Funktion zum Erstellen einer Aufgabe aus einem Jour-fixe-Eintrag
  const createTaskFromEntry = async (entry: JourFixeEntry, currentTasks: typeof tasks = tasks) => {
    if (!entry.aufgabenfeld || !entry.verantwortlich) {
      console.log('Eintrag übersprungen: fehlende Daten', entry.id)
      return false
    }

    // Prüfe, ob bereits eine Aufgabe mit diesem Titel existiert
    const taskTitle = entry.aufgabenfeld.length > 80 
      ? entry.aufgabenfeld.substring(0, 77) + '...' 
      : entry.aufgabenfeld
    
    // Prüfe auf Duplikate - weniger strikt
    const taskExists = currentTasks.some(task => {
      const titleMatch = task.title === taskTitle || task.title === entry.aufgabenfeld
      const descMatch = task.description && 
        task.description.includes('[Erstellt aus Jour Fixe - To-Do-Liste]') && 
        task.description.includes(entry.aufgabenfeld.substring(0, 50))
      return titleMatch || descMatch
    })

    if (taskExists) {
      console.log('Aufgabe existiert bereits:', taskTitle)
      setEntriesProcessed(prev => new Set(prev).add(entry.id))
      return false
    }

    // Priorität mappen
    const taskPriority = entry.prioritaet === 'Hoch' ? 'Hoch' : 
                        entry.prioritaet === 'Mittel' ? 'Mittel' : 'Niedrig'
    
    // Fälligkeitsdatum: verwende terminSoll, falls vorhanden, sonst 30 Tage in der Zukunft
    let dueDate = entry.terminSoll
    if (!dueDate || dueDate === '2021' || dueDate.length === 4) {
      // Wenn nur Jahr angegeben oder leer, setze 30 Tage in der Zukunft
      const date = new Date()
      date.setDate(date.getDate() + 30)
      dueDate = date.toISOString().split('T')[0]
    }
    
    // Beschreibung zusammenstellen
    const description = [
      `Bereich: ${entry.bereich}`,
      `Kategorie: ${entry.kategorie}`,
      `Vereinbart am: ${entry.vereinbartAm ? new Date(entry.vereinbartAm).toLocaleDateString('de-DE') : '-'}`,
      '',
      `Aufgabenfeld / Prozess / Ursache:`,
      entry.aufgabenfeld,
      '',
      entry.klaerung ? `Klärung / Maßnahme:\n${entry.klaerung}` : '',
      entry.beteiligt ? `Beteiligt: ${entry.beteiligt}` : '',
      '',
      `[Erstellt aus Jour Fixe - To-Do-Liste]`
    ].filter(Boolean).join('\n')
    
    // Aufgabe erstellen
    try {
      console.log('Erstelle Aufgabe:', taskTitle, 'für', entry.verantwortlich)
      await addTask({
        title: taskTitle,
        description: description,
        priority: taskPriority,
        dueDate: dueDate,
        assignedTo: entry.verantwortlich
      })
      
      console.log('Aufgabe erfolgreich erstellt:', taskTitle)
      // Markiere diesen Eintrag als verarbeitet
      setEntriesProcessed(prev => new Set(prev).add(entry.id))
      return true
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error)
      return false
    }
  }

  // Funktion zum manuellen Synchronisieren aller Einträge
  const syncAllEntriesToTasks = async () => {
    let syncedCount = 0
    let skippedCount = 0
    
    // Aktuelle Aufgaben-Liste verwenden
    const currentTasks = tasks
    
    console.log('Starte Synchronisation. Aktuelle Aufgaben:', currentTasks.length)
    console.log('Jour-fixe-Einträge:', entries.length)
    
    // Temporär entriesProcessed zurücksetzen für manuelle Synchronisation
    const originalProcessed = new Set(entriesProcessed)
    setEntriesProcessed(new Set())
    
    for (const entry of entries) {
      if (entry.aufgabenfeld && entry.verantwortlich) {
        const created = await createTaskFromEntry(entry, currentTasks)
        if (created) {
          syncedCount++
          // Kurze Pause zwischen den Erstellungen
          await new Promise(resolve => setTimeout(resolve, 300))
        } else {
          skippedCount++
        }
      }
    }
    
    const message = syncedCount > 0 
      ? `${syncedCount} Aufgabe(n) aus Jour-fixe-Einträgen erstellt.${skippedCount > 0 ? ` ${skippedCount} bereits vorhanden.` : ''}`
      : `Alle Jour-fixe-Einträge sind bereits als Aufgaben vorhanden. (${skippedCount} geprüft)`
    
    alert(message)
    console.log('Synchronisation abgeschlossen:', { syncedCount, skippedCount })
  }

  // Lade Jour-fixe Einträge aus der Datenbank
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await fetch('/api/jour-fixe')
        if (!response.ok) throw new Error('Failed to fetch entries')
        const data = await response.json()
        setEntries(data)
      } catch (error) {
        console.error('Failed to load jour-fixe entries:', error)
      }
    }
    loadEntries()
  }, [])

  // Beim Laden der Seite alle bestehenden Jour-fixe-Einträge in Aufgaben umwandeln
  useEffect(() => {
    // Warte bis tasks geladen sind (nur einmal beim ersten Laden)
    const timer = setTimeout(async () => {
      console.log('Automatische Synchronisation gestartet')
      console.log('Tasks geladen:', tasks.length)
      console.log('Entries:', entries.length)
      
      for (const entry of entries) {
        if (!entriesProcessed.has(entry.id) && entry.aufgabenfeld && entry.verantwortlich) {
          await createTaskFromEntry(entry, tasks)
          // Kurze Pause zwischen den Erstellungen
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
    }, 2000) // Verzögerung, damit tasks geladen sind

    return () => clearTimeout(timer)
  }, [entries]) // Abhängig von entries, damit es nach dem Laden ausgeführt wird

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let finalFormData = { ...formData }
    
    // PDF hochladen, falls vorhanden
    if (pdfFile) {
      setUploadingPdf(true)
      try {
        const uploadResult = await uploadInfoPdf(pdfFile)
        finalFormData.pdfUrl = uploadResult.publicUrl
        finalFormData.pdfName = pdfFile.name
      } catch (error) {
        console.error('Fehler beim Hochladen des PDFs:', error)
        alert('Fehler beim Hochladen des PDFs. Bitte versuchen Sie es erneut.')
        setUploadingPdf(false)
        return
      }
      setUploadingPdf(false)
    }
    
    if (editingEntry) {
      // Update existing entry
      try {
        const response = await fetch(`/api/jour-fixe/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalFormData)
        })
        if (!response.ok) throw new Error('Failed to update entry')
        const updatedEntry = await response.json()
        setEntries(prev => prev.map(entry => 
          entry.id === editingEntry.id ? updatedEntry : entry
        ))
        setEditingEntry(null)
      } catch (error) {
        console.error('Failed to update entry:', error)
        alert('Fehler beim Aktualisieren des Eintrags. Bitte versuchen Sie es erneut.')
        return
      }
    } else {
      // Create new entry
      try {
        const response = await fetch('/api/jour-fixe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalFormData)
        })
        if (!response.ok) throw new Error('Failed to create entry')
        const newEntry = await response.json()
        setEntries(prev => [...prev, newEntry])
        
        // Automatisch eine Aufgabe aus dem Jour-fixe-Eintrag erstellen
        if (formData.aufgabenfeld && formData.verantwortlich) {
          // Priorität mappen (Jour-fixe verwendet: Niedrig, Mittel, Hoch)
          // Aufgaben verwendet: Niedrig, Mittel, Hoch, Kritisch
          const taskPriority = formData.prioritaet === 'Hoch' ? 'Hoch' : 
                              formData.prioritaet === 'Mittel' ? 'Mittel' : 'Niedrig'
          
          // Fälligkeitsdatum: verwende terminSoll, falls vorhanden, sonst 30 Tage in der Zukunft
          const dueDate = formData.terminSoll || (() => {
            const date = new Date()
            date.setDate(date.getDate() + 30)
            return date.toISOString().split('T')[0]
          })()
          
          // Beschreibung zusammenstellen
          const description = [
            `Bereich: ${formData.bereich}`,
            `Kategorie: ${formData.kategorie}`,
            `Vereinbart am: ${formData.vereinbartAm ? new Date(formData.vereinbartAm).toLocaleDateString('de-DE') : '-'}`,
            '',
            `Aufgabenfeld / Prozess / Ursache:`,
            formData.aufgabenfeld,
            '',
            formData.klaerung ? `Klärung / Maßnahme:\n${formData.klaerung}` : '',
            formData.beteiligt ? `\nBeteiligt: ${formData.beteiligt}` : '',
            '',
            `[Erstellt aus Jour Fixe - To-Do-Liste]`
          ].filter(Boolean).join('\n')
          
          // Aufgabe erstellen
          addTask({
            title: formData.aufgabenfeld.length > 80 
              ? formData.aufgabenfeld.substring(0, 77) + '...' 
              : formData.aufgabenfeld,
            description: description,
            priority: taskPriority,
            dueDate: dueDate,
            assignedTo: formData.verantwortlich
          })
        }
      } catch (error) {
        console.error('Failed to create entry:', error)
        alert('Fehler beim Erstellen des Eintrags. Bitte versuchen Sie es erneut.')
        return
      }
    }
    
    setShowForm(false)
    setPdfFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFormData({
      bereich: '',
      kategorie: '',
      vereinbartAm: '',
      aufgabenfeld: '',
      klaerung: '',
      verantwortlich: '',
      beteiligt: '',
      terminSoll: '',
      abschlussTermin: '',
      prioritaet: 'Mittel',
      status: 'warte',
      pdfUrl: '',
      pdfName: ''
    })
  }

  const handleEdit = (entry: JourFixeEntry) => {
    setEditingEntry(entry)
    setPdfFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFormData({
      bereich: entry.bereich,
      kategorie: entry.kategorie,
      vereinbartAm: entry.vereinbartAm,
      aufgabenfeld: entry.aufgabenfeld,
      klaerung: entry.klaerung,
      verantwortlich: entry.verantwortlich,
      beteiligt: entry.beteiligt,
      terminSoll: entry.terminSoll,
      abschlussTermin: entry.abschlussTermin,
      prioritaet: entry.prioritaet,
      status: entry.status,
      pdfUrl: entry.pdfUrl || '',
      pdfName: entry.pdfName || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      try {
        const response = await fetch(`/api/jour-fixe?id=${id}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete entry')
        setEntries(prev => prev.filter(entry => entry.id !== id))
      } catch (error) {
        console.error('Failed to delete entry:', error)
        alert('Fehler beim Löschen des Eintrags. Bitte versuchen Sie es erneut.')
      }
    }
  }

  const handleStatusChange = async (id: string, newStatus: JourFixeEntry['status']) => {
    const entry = entries.find(e => e.id === id)
    if (!entry) return

    const updated = { ...entry, status: newStatus }
    // Wenn auf "erledigt" gesetzt, automatisch Abschlusstermin setzen falls leer
    if (newStatus === 'erledigt' && !updated.abschlussTermin) {
      updated.abschlussTermin = new Date().toISOString().split('T')[0]
    }

    try {
      const response = await fetch(`/api/jour-fixe/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bereich: updated.bereich,
          kategorie: updated.kategorie,
          vereinbartAm: updated.vereinbartAm,
          aufgabenfeld: updated.aufgabenfeld,
          klaerung: updated.klaerung,
          verantwortlich: updated.verantwortlich,
          beteiligt: updated.beteiligt,
          terminSoll: updated.terminSoll,
          abschlussTermin: updated.abschlussTermin,
          prioritaet: updated.prioritaet,
          status: updated.status,
          pdfUrl: updated.pdfUrl,
          pdfName: updated.pdfName
        })
      })
      if (!response.ok) throw new Error('Failed to update status')
      const updatedEntry = await response.json()
      setEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry : entry
      ))
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Fehler beim Aktualisieren des Status. Bitte versuchen Sie es erneut.')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })
    } catch {
      return dateString
    }
  }

  const getPrioritaetColor = (prioritaet: JourFixeEntry['prioritaet']) => {
    switch (prioritaet) {
      case 'Niedrig': return 'bg-blue-100 text-blue-800'
      case 'Mittel': return 'bg-yellow-100 text-yellow-800'
      case 'Hoch': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: JourFixeEntry['status']) => {
    switch (status) {
      case 'warte': return 'bg-gray-100 text-gray-800'
      case 'in Arbeit': return 'bg-green-100 text-green-800'
      case 'erledigt': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Funktion zum Filtern von Einträgen für PDF
  const getFilteredEntriesForPdf = () => {
    return entries.filter(entry => {
      // Mehrfachauswahl für Bereich
      const matchesBereich = pdfFilters.bereich.length === 0 || pdfFilters.bereich.includes(entry.bereich)
      
      // Mehrfachauswahl für Status
      const matchesStatus = pdfFilters.status.length === 0 || pdfFilters.status.includes(entry.status)
      
      // Zeitraum-Filterung
      let matchesDateRange = true
      if (pdfFilters.dateFrom || pdfFilters.dateTo) {
        const entryDate = entry.vereinbartAm ? new Date(entry.vereinbartAm) : null
        if (entryDate) {
          if (pdfFilters.dateFrom) {
            const fromDate = new Date(pdfFilters.dateFrom)
            fromDate.setHours(0, 0, 0, 0)
            if (entryDate < fromDate) matchesDateRange = false
          }
          if (pdfFilters.dateTo) {
            const toDate = new Date(pdfFilters.dateTo)
            toDate.setHours(23, 59, 59, 999)
            if (entryDate > toDate) matchesDateRange = false
          }
        } else {
          matchesDateRange = false
        }
      }
      
      return matchesBereich && matchesStatus && matchesDateRange
    })
  }

  // Funktion zum Toggle eines Bereichs in der Mehrfachauswahl
  const toggleBereich = (bereich: string) => {
    setPdfFilters(prev => ({
      ...prev,
      bereich: prev.bereich.includes(bereich)
        ? prev.bereich.filter(b => b !== bereich)
        : [...prev.bereich, bereich]
    }))
  }

  // Funktion zum Toggle eines Status in der Mehrfachauswahl
  const toggleStatus = (status: string) => {
    setPdfFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  // Funktion zum Generieren des PDF-Protokolls
  const generatePdfProtocol = () => {
    const filteredEntries = getFilteredEntriesForPdf()
    
    if (filteredEntries.length === 0) {
      alert('Keine Einträge gefunden, die den ausgewählten Filtern entsprechen.')
      return
    }

    // HTML für PDF erstellen
    const tableRows = filteredEntries.map(entry => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${entry.bereich || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${entry.kategorie || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${formatDate(entry.vereinbartAm)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${entry.aufgabenfeld || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${entry.klaerung || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${entry.verantwortlich || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${entry.beteiligt || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${formatDate(entry.terminSoll)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${formatDate(entry.abschlussTermin)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${entry.prioritaet || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:11px;">${entry.status === 'warte' ? 'Warte' : entry.status === 'in Arbeit' ? 'In Arbeit' : 'Erledigt'}</td>
      </tr>
    `).join('')

    const filterInfo = [
      pdfFilters.bereich.length > 0 ? `Bereich: ${pdfFilters.bereich.join(', ')}` : '',
      pdfFilters.status.length > 0 ? `Status: ${pdfFilters.status.map(s => s === 'warte' ? 'Warte' : s === 'in Arbeit' ? 'In Arbeit' : 'Erledigt').join(', ')}` : '',
      pdfFilters.dateFrom || pdfFilters.dateTo ? `Zeitraum: ${pdfFilters.dateFrom ? formatDate(pdfFilters.dateFrom) : 'Anfang'} - ${pdfFilters.dateTo ? formatDate(pdfFilters.dateTo) : 'Heute'}` : ''
    ].filter(Boolean).join(' • ')

    const html = `<!doctype html>
      <html lang="de">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>Jour Fixe Protokoll</title>
          <style>
            @media print {
              @page { margin: 1cm; size: A4 landscape; }
              body { margin: 0; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              margin: 24px;
              font-size: 12px;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 8px 0;
              color: #1f2937;
            }
            .meta {
              color: #6b7280;
              font-size: 11px;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 10px;
              margin-top: 16px;
            }
            thead td {
              background: #f3f4f6;
              font-weight: 700;
              padding: 8px;
              border: 1px solid #e5e7eb;
            }
            tbody td {
              padding: 6px;
              border: 1px solid #e5e7eb;
              word-wrap: break-word;
              max-width: 150px;
            }
            .footer {
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 10px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Jour Fixe - To-Do-Liste Protokoll</h1>
          <div class="meta">
            Erstellt am: ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            ${filterInfo ? `• ${filterInfo}` : ''}
            • Anzahl Einträge: ${filteredEntries.length}
          </div>
          <table>
            <thead>
              <tr>
                <td>Bereich</td>
                <td>Kategorie</td>
                <td>vereinbart am</td>
                <td>Aufgabenfeld / Prozess / Ursache</td>
                <td>Klärung / Maßnahme</td>
                <td>Verantwortlich</td>
                <td>Beteiligt</td>
                <td>Termin SOLL</td>
                <td>Abschluss-termin</td>
                <td>Priorität</td>
                <td>Status</td>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            Stadtholding Landau in der Pfalz - Jour Fixe Protokoll
          </div>
          <script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.print();
              }, 500);
            });
          </script>
        </body>
      </html>`

    // PDF in neuem Fenster öffnen
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    }

    // E-Mail-Modal anzeigen
    setShowPdfModal(false)
    setShowEmailModal(true)
  }

  // Funktion zum Versenden des PDFs per E-Mail
  const sendPdfByEmail = () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      return
    }

    // Simuliere E-Mail-Versand
    const filteredEntries = getFilteredEntriesForPdf()
    alert(`PDF-Protokoll wurde an ${emailAddress} gesendet.\n\nAnzahl Einträge: ${filteredEntries.length}\nBereich: ${pdfFilters.bereich.length > 0 ? pdfFilters.bereich.join(', ') : 'Alle'}\nStatus: ${pdfFilters.status.length > 0 ? pdfFilters.status.map(s => s === 'warte' ? 'Warte' : s === 'in Arbeit' ? 'In Arbeit' : 'Erledigt').join(', ') : 'Alle'}\nZeitraum: ${pdfFilters.dateFrom ? formatDate(pdfFilters.dateFrom) : 'Anfang'} - ${pdfFilters.dateTo ? formatDate(pdfFilters.dateTo) : 'Heute'}`)
    
    setShowEmailModal(false)
    setEmailAddress('')
    setPdfFilters({
      bereich: [],
      status: [],
      dateFrom: '',
      dateTo: ''
    })
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center">
          Jour fixe
        </h1>
        <p className="text-center text-white/90 text-lg">
          Jour Fixe - To-Do-Liste: Protokollierung regelmäßiger Treffen und deren Einträge
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Zum Umgang mit der to-do-Liste:</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Erledigte Punkte sind von dem/der Verantwortlichen auf "erledigt" zu stellen,</li>
          <li>hierbei ist der Abschlusstermin anzugeben,</li>
          <li>bei Verzögerungen bei der Erledigung ist die VL per Mail zu informieren.</li>
        </ul>
      </div>

      {/* Dashboard Statistics - Clickable Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Überfällig */}
        <button
          onClick={() => handleFilterClick('overdue')}
          className={`bg-red-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
            activeFilter === 'overdue' 
              ? 'border-red-500 ring-2 ring-red-300 shadow-lg' 
              : 'border-red-200 hover:border-red-400'
          }`}
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-xl">🚨</span>
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-red-800">Überfällig</p>
              <p className="text-2xl font-bold text-red-900">
                {entries.filter(entry => isOverdue(entry.terminSoll, entry.status)).length}
              </p>
            </div>
          </div>
          {activeFilter === 'overdue' && (
            <div className="mt-2 text-xs text-red-700 font-medium">✓ Aktiver Filter</div>
          )}
        </button>

        {/* Heute fällig */}
        <button
          onClick={() => handleFilterClick('today')}
          className={`bg-orange-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
            activeFilter === 'today' 
              ? 'border-orange-500 ring-2 ring-orange-300 shadow-lg' 
              : 'border-orange-200 hover:border-orange-400'
          }`}
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-orange-800">Heute fällig</p>
              <p className="text-2xl font-bold text-orange-900">
                {entries.filter(entry => isDueToday(entry.terminSoll, entry.status)).length}
              </p>
            </div>
          </div>
          {activeFilter === 'today' && (
            <div className="mt-2 text-xs text-orange-700 font-medium">✓ Aktiver Filter</div>
          )}
        </button>

        {/* Offen/Warte */}
        <button
          onClick={() => handleFilterClick('open')}
          className={`bg-blue-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
            activeFilter === 'open' 
              ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg' 
              : 'border-blue-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-xl">📋</span>
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-blue-800">Warte</p>
              <p className="text-2xl font-bold text-blue-900">
                {entries.filter(entry => entry.status === 'warte').length}
              </p>
            </div>
          </div>
          {activeFilter === 'open' && (
            <div className="mt-2 text-xs text-blue-700 font-medium">✓ Aktiver Filter</div>
          )}
        </button>

        {/* Erledigt */}
        <button
          onClick={() => handleFilterClick('completed')}
          className={`bg-green-50 border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
            activeFilter === 'completed' 
              ? 'border-green-500 ring-2 ring-green-300 shadow-lg' 
              : 'border-green-200 hover:border-green-400'
          }`}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl">✅</span>
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-green-800">Erledigt</p>
              <p className="text-2xl font-bold text-green-900">
                {entries.filter(entry => entry.status === 'erledigt').length}
              </p>
            </div>
          </div>
          {activeFilter === 'completed' && (
            <div className="mt-2 text-xs text-green-700 font-medium">✓ Aktiver Filter</div>
          )}
        </button>
      </div>

      {/* Actions and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowForm(true)
              setEditingEntry(null)
              setPdfFile(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
              setFormData({
                bereich: '',
                kategorie: '',
                vereinbartAm: '',
                aufgabenfeld: '',
                klaerung: '',
                verantwortlich: '',
                beteiligt: '',
                terminSoll: '',
                abschlussTermin: '',
                prioritaet: 'Mittel',
                status: 'warte',
                pdfUrl: '',
                pdfName: ''
              })
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Neuer Eintrag
          </button>
          <button
            onClick={() => {
              setPdfFilters({
                bereich: [],
                status: [],
                dateFrom: '',
                dateTo: ''
              })
              setShowPdfModal(true)
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            📄 Protokoll als PDF erstellen
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activeFilter === 'overdue' && '🚨 Überfällige Einträge'}
            {activeFilter === 'today' && '⚠️ Heute fällige Einträge'}
            {activeFilter === 'open' && '📋 Wartende Einträge'}
            {activeFilter === 'completed' && '✅ Erledigte Einträge'}
            {activeFilter === 'all' && 'Alle Einträge'}
          </h2>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-gray-600">
              {sortedEntries.length} {sortedEntries.length === 1 ? 'Eintrag' : 'Einträge'} angezeigt
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Filter</label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={filterBereich}
                      onChange={(e) => setFilterBereich(e.target.value)}
                      className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none cursor-pointer min-w-[150px]"
                      style={{ color: filterBereich ? '#111827' : '#6b7280' }}
                    >
                      <option value="" disabled style={{ display: 'none' }}>Alle Bereiche</option>
                      <option value="">Alle Bereiche</option>
                      {mockBereiche.map(bereich => (
                        <option key={bereich} value={bereich}>{bereich}</option>
                      ))}
                    </select>
                    {!filterBereich && (
                      <div className="absolute inset-0 flex items-center px-4 pointer-events-none text-gray-500 text-sm">
                        Alle Bereiche
                      </div>
                    )}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={filterKategorie}
                      onChange={(e) => setFilterKategorie(e.target.value)}
                      className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none cursor-pointer min-w-[150px]"
                      style={{ color: filterKategorie ? '#111827' : '#6b7280' }}
                    >
                      <option value="" disabled style={{ display: 'none' }}>Alle Kategorien</option>
                      <option value="">Alle Kategorien</option>
                      {mockKategorien.map(kategorie => (
                        <option key={kategorie} value={kategorie}>{kategorie}</option>
                      ))}
                    </select>
                    {!filterKategorie && (
                      <div className="absolute inset-0 flex items-center px-4 pointer-events-none text-gray-500 text-sm">
                        Alle Kategorien
                      </div>
                    )}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none cursor-pointer min-w-[150px]"
                      style={{ color: filterStatus ? '#111827' : '#6b7280' }}
                    >
                      <option value="" disabled style={{ display: 'none' }}>Alle Status</option>
                      <option value="">Alle Status</option>
                      {mockStatus.map(status => (
                        <option key={status} value={status}>
                          {status === 'warte' ? 'Warte' : status === 'in Arbeit' ? 'In Arbeit' : 'Erledigt'}
                        </option>
                      ))}
                    </select>
                    {!filterStatus && (
                      <div className="absolute inset-0 flex items-center px-4 pointer-events-none text-gray-500 text-sm">
                        Alle Status
                      </div>
                    )}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              {(activeFilter !== 'all' || filterBereich || filterKategorie || filterStatus) && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Aktiver Filter:</span>
                  {activeFilter !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {activeFilter === 'overdue' && 'Überfällig'}
                      {activeFilter === 'today' && 'Heute fällig'}
                      {activeFilter === 'open' && 'Warte'}
                      {activeFilter === 'completed' && 'Erledigt'}
                    </span>
                  )}
                  {filterBereich && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Bereich: {filterBereich}
                    </span>
                  )}
                  {filterKategorie && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Kategorie: {filterKategorie}
                    </span>
                  )}
                  {filterStatus && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Status: {filterStatus === 'warte' ? 'Warte' : filterStatus === 'in Arbeit' ? 'In Arbeit' : 'Erledigt'}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setActiveFilter('all')
                      setFilterBereich('')
                      setFilterKategorie('')
                      setFilterStatus('')
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Alle anzeigen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('bereich')}
                >
                  <div className="flex items-center gap-2">
                    Bereich
                    {sortColumn === 'bereich' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('kategorie')}
                >
                  <div className="flex items-center gap-2">
                    Kategorie
                    {sortColumn === 'kategorie' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('vereinbartAm')}
                >
                  <div className="flex items-center gap-2">
                    vereinbart am
                    {sortColumn === 'vereinbartAm' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('aufgabenfeld')}
                >
                  <div className="flex items-center gap-2">
                    Aufgabenfeld / Prozess / Ursache
                    {sortColumn === 'aufgabenfeld' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('klaerung')}
                >
                  <div className="flex items-center gap-2">
                    Klärung / Maßnahme
                    {sortColumn === 'klaerung' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('verantwortlich')}
                >
                  <div className="flex items-center gap-2">
                    Verantwortlich
                    {sortColumn === 'verantwortlich' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('beteiligt')}
                >
                  <div className="flex items-center gap-2">
                    Beteiligt
                    {sortColumn === 'beteiligt' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('terminSoll')}
                >
                  <div className="flex items-center gap-2">
                    Termin SOLL
                    {sortColumn === 'terminSoll' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('abschlussTermin')}
                >
                  <div className="flex items-center gap-2">
                    Abschluss-termin
                    {sortColumn === 'abschlussTermin' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('prioritaet')}
                >
                  <div className="flex items-center gap-2">
                    Priorität
                    {sortColumn === 'prioritaet' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Anhang</th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortColumn === 'status' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {activeFilter !== 'all' ? `Keine Einträge für diesen Filter` : 'Keine Einträge gefunden'}
              </h3>
              <p className="text-gray-600">
                      {activeFilter !== 'all' 
                        ? 'Versuchen Sie einen anderen Filter oder erstellen Sie einen neuen Eintrag.' 
                        : 'Erstellen Sie Ihren ersten Eintrag, um zu beginnen.'}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{entry.bereich}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{entry.kategorie}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.vereinbartAm)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">{entry.aufgabenfeld}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">{entry.klaerung}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{entry.verantwortlich}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{entry.beteiligt || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.terminSoll)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.abschlussTermin)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioritaetColor(entry.prioritaet)}`}>
                        {entry.prioritaet}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {entry.pdfUrl ? (
                        <a
                          href={entry.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                          title={entry.pdfName || 'PDF öffnen'}
                        >
                          📎 {entry.pdfName ? (entry.pdfName.length > 20 ? entry.pdfName.substring(0, 17) + '...' : entry.pdfName) : 'PDF'}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={entry.status}
                        onChange={(e) => handleStatusChange(entry.id, e.target.value as JourFixeEntry['status'])}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getStatusColor(entry.status)}`}
                      >
                        <option value="warte">Warte</option>
                        <option value="in Arbeit">In Arbeit</option>
                        <option value="erledigt">Erledigt</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Bearbeiten"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Löschen"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEntry ? 'Eintrag bearbeiten' : 'Neuer Jour Fixe Eintrag'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bereich *
                  </label>
                  <select
                    required
                    value={formData.bereich}
                    onChange={(e) => setFormData({ ...formData, bereich: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Bitte wählen</option>
                    {mockBereiche.map(bereich => (
                      <option key={bereich} value={bereich}>{bereich}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie *
                  </label>
                  <select
                    required
                    value={formData.kategorie}
                    onChange={(e) => setFormData({ ...formData, kategorie: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Bitte wählen</option>
                    {mockKategorien.map(kategorie => (
                      <option key={kategorie} value={kategorie}>{kategorie}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    vereinbart am *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.vereinbartAm}
                    onChange={(e) => setFormData({ ...formData, vereinbartAm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                        </div>
                        
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorität *
                  </label>
                  <select
                    required
                    value={formData.prioritaet}
                    onChange={(e) => setFormData({ ...formData, prioritaet: e.target.value as JourFixeEntry['prioritaet'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    {mockPrioritaeten.map(prioritaet => (
                      <option key={prioritaet} value={prioritaet}>{prioritaet}</option>
                    ))}
                  </select>
                </div>

                            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JourFixeEntry['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    {mockStatus.map(status => (
                      <option key={status} value={status}>
                        {status === 'warte' ? 'Warte' : status === 'in Arbeit' ? 'In Arbeit' : 'Erledigt'}
                      </option>
                    ))}
                  </select>
                            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verantwortlich *
                  </label>
                  <select
                    required
                    value={formData.verantwortlich}
                    onChange={(e) => setFormData({ ...formData, verantwortlich: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Bitte wählen</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                          </div>
                          
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beteiligt
                  </label>
                  <select
                    value={formData.beteiligt}
                    onChange={(e) => setFormData({ ...formData, beteiligt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Keine</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                          </div>
                          
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Termin SOLL
                  </label>
                  <input
                    type="date"
                    value={formData.terminSoll}
                    onChange={(e) => setFormData({ ...formData, terminSoll: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                          </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abschluss-termin
                  </label>
                  <input
                    type="date"
                    value={formData.abschlussTermin}
                    onChange={(e) => setFormData({ ...formData, abschlussTermin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                      </div>
                    </div>
                    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aufgabenfeld / Prozess / Ursache *
                </label>
                <textarea
                  required
                  value={formData.aufgabenfeld}
                  onChange={(e) => setFormData({ ...formData, aufgabenfeld: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Beschreiben Sie die Aufgabe, den Prozess oder die Ursache..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klärung / Maßnahme
                </label>
                <textarea
                  value={formData.klaerung}
                  onChange={(e) => setFormData({ ...formData, klaerung: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Beschreiben Sie die Klärung oder Maßnahme..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF-Anhang
                </label>
                <div className="space-y-2">
                  {formData.pdfUrl && !pdfFile && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <a
                        href={formData.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
                      >
                        📎 {formData.pdfName || 'Aktuelles PDF'}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, pdfUrl: '', pdfName: '' })
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {pdfFile && (
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-800 flex items-center gap-1">
                        📎 {pdfFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.type !== 'application/pdf') {
                          alert('Bitte wählen Sie eine PDF-Datei aus.')
                          e.target.value = ''
                          return
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          alert('Die Datei ist zu groß. Maximale Größe: 10 MB')
                          e.target.value = ''
                          return
                        }
                        setPdfFile(file)
                        setFormData({ ...formData, pdfUrl: '', pdfName: '' })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                  />
                  <p className="text-xs text-gray-500">Nur PDF-Dateien, max. 10 MB</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button 
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingEntry(null)
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                        </button>
                <button
                  type="submit"
                  disabled={uploadingPdf}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingPdf ? 'Wird hochgeladen...' : editingEntry ? 'Aktualisieren' : 'Erstellen'}
                </button>
                    </div>
            </form>
                </div>
        </div>
      )}

      {/* PDF-Protokoll Filter Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Protokoll als PDF erstellen</h2>
              <p className="text-gray-600 mt-1">Wählen Sie die Filter für das Protokoll</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bereich (Mehrfachauswahl)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                  <div className="space-y-2">
                    {mockBereiche.map(bereich => (
                      <label key={bereich} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={pdfFilters.bereich.includes(bereich)}
                          onChange={() => toggleBereich(bereich)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{bereich}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {pdfFilters.bereich.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pdfFilters.bereich.map(bereich => (
                      <span
                        key={bereich}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {bereich}
                        <button
                          type="button"
                          onClick={() => toggleBereich(bereich)}
                          className="hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {pdfFilters.bereich.length === 0 ? 'Alle Bereiche ausgewählt' : `${pdfFilters.bereich.length} Bereich(e) ausgewählt`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status (Mehrfachauswahl)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="space-y-2">
                    {[
                      { value: 'warte', label: 'Warte' },
                      { value: 'in Arbeit', label: 'In Arbeit' },
                      { value: 'erledigt', label: 'Erledigt' }
                    ].map(status => (
                      <label key={status.value} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={pdfFilters.status.includes(status.value)}
                          onChange={() => toggleStatus(status.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {pdfFilters.status.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pdfFilters.status.map(status => (
                      <span
                        key={status}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {status === 'warte' ? 'Warte' : status === 'in Arbeit' ? 'In Arbeit' : 'Erledigt'}
                        <button
                          type="button"
                          onClick={() => toggleStatus(status)}
                          className="hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {pdfFilters.status.length === 0 ? 'Alle Status ausgewählt' : `${pdfFilters.status.length} Status ausgewählt`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Von (Datum)
                  </label>
                  <input
                    type="date"
                    value={pdfFilters.dateFrom}
                    onChange={(e) => setPdfFilters({ ...pdfFilters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bis (Datum)
                  </label>
                  <input
                    type="date"
                    value={pdfFilters.dateTo}
                    onChange={(e) => setPdfFilters({ ...pdfFilters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Gefilterte Einträge:</strong> {getFilteredEntriesForPdf().length} Eintrag(e) werden im Protokoll enthalten sein.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowPdfModal(false)
                    setPdfFilters({
                      bereich: [],
                      status: [],
                      dateFrom: '',
                      dateTo: ''
                    })
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={generatePdfProtocol}
                  disabled={getFilteredEntriesForPdf().length === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  PDF erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-Mail-Versand Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">PDF per E-Mail versenden</h2>
              <p className="text-gray-600 mt-1">Geben Sie die E-Mail-Adresse ein, an die das Protokoll gesendet werden soll</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse *
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="z.B. beispiel@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Protokoll-Details:</strong>
                </p>
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  <li>• Anzahl Einträge: {getFilteredEntriesForPdf().length}</li>
                  <li>• Bereich: {pdfFilters.bereich.length > 0 ? pdfFilters.bereich.join(', ') : 'Alle'}</li>
                  <li>• Status: {pdfFilters.status.length > 0 ? pdfFilters.status.map(s => s === 'warte' ? 'Warte' : s === 'in Arbeit' ? 'In Arbeit' : 'Erledigt').join(', ') : 'Alle'}</li>
                  <li>• Zeitraum: {pdfFilters.dateFrom ? formatDate(pdfFilters.dateFrom) : 'Anfang'} - {pdfFilters.dateTo ? formatDate(pdfFilters.dateTo) : 'Heute'}</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false)
                    setEmailAddress('')
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={sendPdfByEmail}
                  disabled={!emailAddress || !emailAddress.includes('@')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Per E-Mail versenden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
