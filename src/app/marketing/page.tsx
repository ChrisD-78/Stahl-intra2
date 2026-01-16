'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

// Types
interface MarketingCampaign {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: 'geplant' | 'aktiv' | 'abgeschlossen'
  types: ('social-media' | 'print' | 'event' | 'email' | 'sonstiges')[]
  location: 'festhalle' | 'altes-kaufhaus' | 'la-ola' | 'freibad'
  responsible: string
  materials: string[]
}

interface MarketingText {
  id: string
  title: string
  content: string
  type: 'social-media' | 'website' | 'print' | 'email'
  createdBy: string
  createdAt: Date
  status: 'entwurf' | 'freigabe' | 'freigegeben' | 'versendet'
  approvedBy?: string
  approvedAt?: Date
}

interface MarketingPoster {
  id: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  fileSize: string
  uploadedBy: string
  uploadedAt: Date
  status: 'entwurf' | 'freigabe' | 'freigegeben' | 'versendet'
  approvedBy?: string
  sentTo?: string[]
  sentAt?: Date
}

export default function MarketingPage() {
  const { isLoggedIn, currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'kalender' | 'texte' | 'plakate' | 'freigaben' | 'versand'>('kalender')
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [texts, setTexts] = useState<MarketingText[]>([])
  const [posters, setPosters] = useState<MarketingPoster[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Modal states
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false)
  const [showNewTextModal, setShowNewTextModal] = useState(false)
  const [showNewPosterModal, setShowNewPosterModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Form states
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    types: [] as ('social-media' | 'print' | 'event' | 'email' | 'sonstiges')[],
    location: 'la-ola' as MarketingCampaign['location']
  })

  const [newText, setNewText] = useState({
    title: '',
    content: '',
    type: 'social-media' as MarketingText['type']
  })

  const [newPoster, setNewPoster] = useState({
    title: '',
    description: '',
    file: null as File | null
  })

  const [sendTo, setSendTo] = useState<string[]>([])

  // Mock users/recipients
  const mockUsers = ['Max Mustermann', 'Anna Schmidt', 'Tom Weber', 'Lisa Müller', 'Peter Klein']
  const mockRecipients = ['Marketing Team', 'Vertrieb', 'Management', 'Alle Mitarbeiter', 'Externe Partner']

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load campaigns
        const campaignsResponse = await fetch('/api/marketing/campaigns')
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json()
          setCampaigns(campaignsData.map((c: any) => ({
            ...c,
            startDate: new Date(c.startDate),
            endDate: new Date(c.endDate)
          })))
        }

        // Load texts
        const textsResponse = await fetch('/api/marketing/texts')
        if (textsResponse.ok) {
          const textsData = await textsResponse.json()
          setTexts(textsData.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            approvedAt: t.approvedAt ? new Date(t.approvedAt) : undefined
          })))
        }

        // Load posters
        const postersResponse = await fetch('/api/marketing/posters')
        if (postersResponse.ok) {
          const postersData = await postersResponse.json()
          setPosters(postersData.map((p: any) => ({
            ...p,
            uploadedAt: new Date(p.uploadedAt),
            sentAt: p.sentAt ? new Date(p.sentAt) : undefined
          })))
        }
      } catch (error) {
        console.error('Failed to load marketing data:', error)
      }
    }
    loadData()
  }, [])

  // Campaign functions
  const handleCreateCampaign = async () => {
    if (!newCampaign.title || !newCampaign.startDate || !newCampaign.endDate || newCampaign.types.length === 0) return

    try {
      const response = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCampaign.title,
          description: newCampaign.description,
          startDate: newCampaign.startDate,
          endDate: newCampaign.endDate,
          types: newCampaign.types,
          location: newCampaign.location,
          responsible: currentUser || 'Unbekannt',
          materials: []
        })
      })
      if (!response.ok) throw new Error('Failed to create campaign')
      const campaign = await response.json()
      setCampaigns([...campaigns, {
        ...campaign,
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate)
      }])
      setShowNewCampaignModal(false)
      setNewCampaign({ title: '', description: '', startDate: '', endDate: '', types: [], location: 'la-ola' })
    } catch (error) {
      console.error('Failed to create campaign:', error)
      alert('Fehler beim Erstellen der Kampagne. Bitte versuchen Sie es erneut.')
    }
  }

  // Text functions
  const handleCreateText = async () => {
    if (!newText.title || !newText.content) return

    try {
      const response = await fetch('/api/marketing/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newText.title,
          content: newText.content,
          type: newText.type,
          createdBy: currentUser || 'Unbekannt'
        })
      })
      if (!response.ok) throw new Error('Failed to create text')
      const text = await response.json()
      setTexts([...texts, {
        ...text,
        createdAt: new Date(text.createdAt),
        approvedAt: text.approvedAt ? new Date(text.approvedAt) : undefined
      }])
      setShowNewTextModal(false)
      setNewText({ title: '', content: '', type: 'social-media' })
    } catch (error) {
      console.error('Failed to create text:', error)
      alert('Fehler beim Erstellen des Textes. Bitte versuchen Sie es erneut.')
    }
  }

  const handleRequestTextApproval = async (textId: string) => {
    try {
      const response = await fetch(`/api/marketing/texts/${textId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'freigabe' })
      })
      if (!response.ok) throw new Error('Failed to request approval')
      const updatedText = await response.json()
      setTexts(texts.map(t => t.id === textId ? {
        ...t,
        ...updatedText,
        createdAt: new Date(updatedText.createdAt),
        approvedAt: updatedText.approvedAt ? new Date(updatedText.approvedAt) : undefined
      } : t))
    } catch (error) {
      console.error('Failed to request approval:', error)
      alert('Fehler beim Anfordern der Freigabe. Bitte versuchen Sie es erneut.')
    }
  }

  const handleApproveText = async (textId: string) => {
    try {
      const response = await fetch(`/api/marketing/texts/${textId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'freigegeben',
          approvedBy: currentUser || 'Unbekannt'
        })
      })
      if (!response.ok) throw new Error('Failed to approve text')
      const updatedText = await response.json()
      setTexts(texts.map(t => t.id === textId ? {
        ...t,
        ...updatedText,
        createdAt: new Date(updatedText.createdAt),
        approvedAt: updatedText.approvedAt ? new Date(updatedText.approvedAt) : undefined
      } : t))
    } catch (error) {
      console.error('Failed to approve text:', error)
      alert('Fehler beim Freigeben des Textes. Bitte versuchen Sie es erneut.')
    }
  }

  // Poster functions
  const handleCreatePoster = async () => {
    if (!newPoster.title || !newPoster.file) return

    try {
      // Upload file first (using existing upload API)
      const formData = new FormData()
      formData.append('file', newPoster.file)
      const uploadResponse = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData
      })
      if (!uploadResponse.ok) throw new Error('Failed to upload file')
      const uploadResult = await uploadResponse.json()

      // Create poster record
      const response = await fetch('/api/marketing/posters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPoster.title,
          description: newPoster.description,
          fileUrl: uploadResult.url || uploadResult.publicUrl,
          fileName: newPoster.file.name,
          fileSize: `${(newPoster.file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedBy: currentUser || 'Unbekannt'
        })
      })
      if (!response.ok) throw new Error('Failed to create poster')
      const poster = await response.json()
      setPosters([...posters, {
        ...poster,
        uploadedAt: new Date(poster.uploadedAt),
        sentAt: poster.sentAt ? new Date(poster.sentAt) : undefined
      }])
      setShowNewPosterModal(false)
      setNewPoster({ title: '', description: '', file: null })
    } catch (error) {
      console.error('Failed to create poster:', error)
      alert('Fehler beim Hochladen des Plakats. Bitte versuchen Sie es erneut.')
    }
  }

  const handleRequestPosterApproval = async (posterId: string) => {
    try {
      const response = await fetch(`/api/marketing/posters/${posterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'freigabe' })
      })
      if (!response.ok) throw new Error('Failed to request approval')
      const updatedPoster = await response.json()
      setPosters(posters.map(p => p.id === posterId ? {
        ...p,
        ...updatedPoster,
        uploadedAt: new Date(updatedPoster.uploadedAt),
        sentAt: updatedPoster.sentAt ? new Date(updatedPoster.sentAt) : undefined
      } : p))
    } catch (error) {
      console.error('Failed to request approval:', error)
      alert('Fehler beim Anfordern der Freigabe. Bitte versuchen Sie es erneut.')
    }
  }

  const handleApprovePoster = async (posterId: string) => {
    try {
      const response = await fetch(`/api/marketing/posters/${posterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'freigegeben',
          approvedBy: currentUser || 'Unbekannt'
        })
      })
      if (!response.ok) throw new Error('Failed to approve poster')
      const updatedPoster = await response.json()
      setPosters(posters.map(p => p.id === posterId ? {
        ...p,
        ...updatedPoster,
        uploadedAt: new Date(updatedPoster.uploadedAt),
        sentAt: updatedPoster.sentAt ? new Date(updatedPoster.sentAt) : undefined
      } : p))
      setShowApprovalModal(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Failed to approve poster:', error)
      alert('Fehler beim Freigeben des Plakats. Bitte versuchen Sie es erneut.')
    }
  }

  const handleSendMaterial = async () => {
    if (!selectedItem || sendTo.length === 0) return

    try {
      if (selectedItem.type === 'poster') {
        const response = await fetch(`/api/marketing/posters/${selectedItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'versendet',
            sentTo: sendTo
          })
        })
        if (!response.ok) throw new Error('Failed to send poster')
        const updatedPoster = await response.json()
        setPosters(posters.map(p => p.id === selectedItem.id ? {
          ...p,
          ...updatedPoster,
          uploadedAt: new Date(updatedPoster.uploadedAt),
          sentAt: updatedPoster.sentAt ? new Date(updatedPoster.sentAt) : undefined
        } : p))
      } else if (selectedItem.type === 'text') {
        const response = await fetch(`/api/marketing/texts/${selectedItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'versendet' })
        })
        if (!response.ok) throw new Error('Failed to send text')
        const updatedText = await response.json()
        setTexts(texts.map(t => t.id === selectedItem.id ? {
          ...t,
          ...updatedText,
          createdAt: new Date(updatedText.createdAt),
          approvedAt: updatedText.approvedAt ? new Date(updatedText.approvedAt) : undefined
        } : t))
      }

      setShowSendModal(false)
      setSelectedItem(null)
      setSendTo([])
    } catch (error) {
      console.error('Failed to send material:', error)
      alert('Fehler beim Versenden des Materials. Bitte versuchen Sie es erneut.')
    }
  }

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getCampaignsForDay = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return campaigns.filter(c => {
      const start = new Date(c.startDate)
      const end = new Date(c.endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      checkDate.setHours(12, 0, 0, 0)
      return checkDate >= start && checkDate <= end
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entwurf': return 'bg-gray-100 text-gray-800'
      case 'freigabe': return 'bg-yellow-100 text-yellow-800'
      case 'freigegeben': return 'bg-green-100 text-green-800'
      case 'versendet': return 'bg-blue-100 text-blue-800'
      case 'geplant': return 'bg-purple-100 text-purple-800'
      case 'aktiv': return 'bg-green-100 text-green-800'
      case 'abgeschlossen': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'social-media': return 'Social Media'
      case 'print': return 'Print'
      case 'event': return 'Event'
      case 'email': return 'E-Mail'
      case 'website': return 'Website'
      case 'sonstiges': return 'Sonstiges'
      default: return type
    }
  }

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'festhalle': return 'Festhalle'
      case 'altes-kaufhaus': return 'Altes Kaufhaus'
      case 'la-ola': return 'LA OLA'
      case 'freibad': return 'Freibad'
      default: return location
    }
  }

  if (!isLoggedIn) {
    return null
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl shadow-xl p-6 lg:p-10 text-white">
        <h1 className="text-2xl lg:text-4xl font-extrabold mb-2">📢 Marketing</h1>
        <p className="text-white/90 max-w-3xl">
          Kampagnen planen, Texte erstellen, Plakate verwalten und Marketing-Materialien freigeben
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'kalender', label: 'Kalender', icon: '📅' },
            { key: 'texte', label: 'Texte', icon: '📝' },
            { key: 'plakate', label: 'Plakate', icon: '🖼️' },
            { key: 'freigaben', label: 'Freigaben', icon: '✓' },
            { key: 'versand', label: 'Versand', icon: '📤' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 min-h-[500px]">
        {/* Kalender Tab */}
        {activeTab === 'kalender' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Kampagnen-Kalender</h2>
              <button
                onClick={() => setShowNewCampaignModal(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Neue Kampagne</span>
              </button>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-900"
              >
                ← Vorheriger Monat
              </button>
              <h3 className="text-xl font-bold text-gray-900">
                {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-900"
              >
                Nächster Monat →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 bg-gray-50">
                {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-700 border-r border-b border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-gray-50 border-r border-b border-gray-200"></div>
                ))}

                {/* Actual days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayCampaigns = getCampaignsForDay(day)
                  const isToday = new Date().getDate() === day && 
                                  new Date().getMonth() === currentMonth.getMonth() &&
                                  new Date().getFullYear() === currentMonth.getFullYear()

                  return (
                    <div
                      key={day}
                      className={`min-h-[100px] p-2 border-r border-b border-gray-200 ${
                        isToday ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayCampaigns.map(campaign => (
                          <div
                            key={campaign.id}
                            className="text-xs p-1 bg-pink-100 text-pink-800 rounded truncate"
                            title={campaign.title}
                          >
                            {campaign.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Campaign List */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Alle Kampagnen</h3>
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{campaign.title}</h4>
                        <p className="text-sm text-gray-600">{campaign.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                      <span className="text-gray-500">📅 {campaign.startDate.toLocaleDateString('de-DE')} - {campaign.endDate.toLocaleDateString('de-DE')}</span>
                      <span className="text-gray-500">📍 {getLocationLabel(campaign.location)}</span>
                      <span className="text-gray-500">👤 {campaign.responsible}</span>
                      <span className="text-gray-500">📎 {campaign.materials.length} Materialien</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      {campaign.types.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
                          {getTypeLabel(type)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Texte Tab */}
        {activeTab === 'texte' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Marketing-Texte</h2>
              <button
                onClick={() => setShowNewTextModal(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Neuer Text</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {texts.map(text => (
                <div key={text.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{text.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{text.content}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-3 ${getStatusColor(text.status)}`}>
                      {text.status.charAt(0).toUpperCase() + text.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📋 {getTypeLabel(text.type)}</span>
                      <span>👤 {text.createdBy}</span>
                      <span>📅 {text.createdAt.toLocaleDateString('de-DE')}</span>
                      {text.approvedBy && <span>✓ Freigegeben von {text.approvedBy}</span>}
                    </div>
                    <div className="flex space-x-2">
                      {text.status === 'entwurf' && (
                        <button
                          onClick={() => handleRequestTextApproval(text.id)}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                        >
                          Freigabe anfragen
                        </button>
                      )}
                      {text.status === 'freigabe' && (
                        <button
                          onClick={() => handleApproveText(text.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Freigeben
                        </button>
                      )}
                      {text.status === 'freigegeben' && (
                        <button
                          onClick={() => {
                            setSelectedItem({ ...text, type: 'text' })
                            setShowSendModal(true)
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Versenden
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plakate Tab */}
        {activeTab === 'plakate' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Plakate & Designs</h2>
              <button
                onClick={() => setShowNewPosterModal(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Plakat hochladen</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posters.map(poster => (
                <div key={poster.id} className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors">
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg h-40 mb-3">
                    <span className="text-6xl">🖼️</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{poster.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{poster.description}</p>
                  <div className="space-y-1 mb-3">
                    <div className="text-xs text-gray-500">📎 {poster.fileName}</div>
                    <div className="text-xs text-gray-500">💾 {poster.fileSize}</div>
                    <div className="text-xs text-gray-500">👤 {poster.uploadedBy}</div>
                    <div className="text-xs text-gray-500">📅 {poster.uploadedAt.toLocaleDateString('de-DE')}</div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(poster.status)}`}>
                      {poster.status.charAt(0).toUpperCase() + poster.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {poster.status === 'entwurf' && (
                      <button
                        onClick={() => handleRequestPosterApproval(poster.id)}
                        className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                      >
                        Freigabe anfragen
                      </button>
                    )}
                    {poster.status === 'freigabe' && (
                      <button
                        onClick={() => {
                          setSelectedItem({ ...poster, type: 'poster' })
                          setShowApprovalModal(true)
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Freigeben
                      </button>
                    )}
                    {poster.status === 'freigegeben' && (
                      <button
                        onClick={() => {
                          setSelectedItem({ ...poster, type: 'poster' })
                          setShowSendModal(true)
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Versenden
                      </button>
                    )}
                    <button className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors">
                      Herunterladen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Freigaben Tab */}
        {activeTab === 'freigaben' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Freigaben</h2>

            {/* Pending Approvals */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">🟡 Warten auf Freigabe</h3>
              <div className="space-y-3">
                {[...texts.filter(t => t.status === 'freigabe'), ...posters.filter(p => p.status === 'freigabe')].length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Keine ausstehenden Freigaben</p>
                ) : (
                  <>
                    {texts.filter(t => t.status === 'freigabe').map(text => (
                      <div key={text.id} className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-2xl">📝</span>
                              <h4 className="font-bold text-gray-900">{text.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{text.content}</p>
                            <div className="text-sm text-gray-500">
                              Erstellt von {text.createdBy} am {text.createdAt.toLocaleDateString('de-DE')}
                            </div>
                          </div>
                          <button
                            onClick={() => handleApproveText(text.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Freigeben
                          </button>
                        </div>
                      </div>
                    ))}
                    {posters.filter(p => p.status === 'freigabe').map(poster => (
                      <div key={poster.id} className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-2xl">🖼️</span>
                              <h4 className="font-bold text-gray-900">{poster.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{poster.description}</p>
                            <div className="text-sm text-gray-500">
                              Hochgeladen von {poster.uploadedBy} am {poster.uploadedAt.toLocaleDateString('de-DE')}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedItem({ ...poster, type: 'poster' })
                              setShowApprovalModal(true)
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Freigeben
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Approved Items */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">✅ Freigegebene Materialien</h3>
              <div className="space-y-3">
                {[...texts.filter(t => t.status === 'freigegeben' || t.status === 'versendet'), 
                  ...posters.filter(p => p.status === 'freigegeben' || p.status === 'versendet')].map((item, index) => (
                  <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{'content' in item ? '📝' : '🖼️'}</span>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Freigegeben von {item.approvedBy} am {item.approvedAt?.toLocaleDateString('de-DE')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Versand Tab */}
        {activeTab === 'versand' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Versand-Übersicht</h2>

            {/* Versendete Materialien */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">📤 Versendete Materialien</h3>
              <div className="space-y-3">
                {posters.filter(p => p.status === 'versendet').map(poster => (
                  <div key={poster.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">🖼️</span>
                          <h4 className="font-bold text-gray-900">{poster.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{poster.description}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-700">
                        <span className="font-medium">Versendet an:</span> {poster.sentTo?.join(', ')}
                      </div>
                      <div className="text-gray-500">
                        📅 Versendet am: {poster.sentAt?.toLocaleDateString('de-DE')}
                      </div>
                      <div className="text-gray-500">
                        👤 Von: {poster.uploadedBy}
                      </div>
                    </div>
                  </div>
                ))}
                {posters.filter(p => p.status === 'versendet').length === 0 && (
                  <p className="text-gray-500 text-center py-8">Noch keine Materialien versendet</p>
                )}
              </div>
            </div>

            {/* Bereit zum Versenden */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">✓ Bereit zum Versenden</h3>
              <div className="space-y-3">
                {[...texts.filter(t => t.status === 'freigegeben'), 
                  ...posters.filter(p => p.status === 'freigegeben')].map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{'content' in item ? '📝' : '🖼️'}</span>
                        <div>
                          <h4 className="font-bold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500">Freigegeben am {item.approvedAt?.toLocaleDateString('de-DE')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedItem({ ...item, type: 'content' in item ? 'text' : 'poster' })
                          setShowSendModal(true)
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Versenden
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Neue Kampagne erstellen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kampagnen-Titel</label>
                <input
                  type="text"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  placeholder="z.B. Sommerferien-Kampagne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  rows={3}
                  placeholder="Beschreibung der Kampagne..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                  <input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum</label>
                  <input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kampagnen-Typen (Mehrfachauswahl möglich)</label>
                <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                  {[
                    { value: 'social-media', label: 'Social Media', icon: '📱' },
                    { value: 'print', label: 'Print', icon: '📄' },
                    { value: 'event', label: 'Event', icon: '🎉' },
                    { value: 'email', label: 'E-Mail', icon: '📧' },
                    { value: 'sonstiges', label: 'Sonstiges', icon: '📋' }
                  ].map(typeOption => (
                    <label key={typeOption.value} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={newCampaign.types.includes(typeOption.value as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCampaign({ ...newCampaign, types: [...newCampaign.types, typeOption.value as any] })
                          } else {
                            setNewCampaign({ ...newCampaign, types: newCampaign.types.filter(t => t !== typeOption.value) })
                          }
                        }}
                        className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700">
                        {typeOption.icon} {typeOption.label}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {newCampaign.types.length === 0 
                    ? 'Mindestens einen Typ auswählen' 
                    : `${newCampaign.types.length} Typ(en) ausgewählt`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📍 Veranstaltungsort</label>
                <select
                  value={newCampaign.location}
                  onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                >
                  <option value="festhalle">Festhalle</option>
                  <option value="altes-kaufhaus">Altes Kaufhaus</option>
                  <option value="la-ola">LA OLA</option>
                  <option value="freibad">Freibad</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateCampaign}
                disabled={!newCampaign.title || !newCampaign.startDate || !newCampaign.endDate || newCampaign.types.length === 0}
                className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kampagne erstellen
              </button>
              <button
                onClick={() => {
                  setShowNewCampaignModal(false)
                  setNewCampaign({ title: '', description: '', startDate: '', endDate: '', types: [], location: 'la-ola' })
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Text Modal */}
      {showNewTextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Neuen Text erstellen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={newText.title}
                  onChange={(e) => setNewText({ ...newText, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  placeholder="z.B. Facebook Post - Sommerangebot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
                <textarea
                  value={newText.content}
                  onChange={(e) => setNewText({ ...newText, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  rows={6}
                  placeholder="Marketing-Text eingeben..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select
                  value={newText.type}
                  onChange={(e) => setNewText({ ...newText, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                >
                  <option value="social-media">Social Media</option>
                  <option value="website">Website</option>
                  <option value="print">Print</option>
                  <option value="email">E-Mail</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateText}
                disabled={!newText.title || !newText.content}
                className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Text erstellen
              </button>
              <button
                onClick={() => {
                  setShowNewTextModal(false)
                  setNewText({ title: '', content: '', type: 'social-media' })
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Poster Modal */}
      {showNewPosterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Plakat hochladen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={newPoster.title}
                  onChange={(e) => setNewPoster({ ...newPoster, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  placeholder="z.B. Sommerangebote Plakat A1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={newPoster.description}
                  onChange={(e) => setNewPoster({ ...newPoster, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                  rows={3}
                  placeholder="Beschreibung des Plakats..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datei</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setNewPoster({ ...newPoster, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">PDF, PNG oder JPG (max. 10 MB)</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreatePoster}
                disabled={!newPoster.title || !newPoster.file}
                className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hochladen
              </button>
              <button
                onClick={() => {
                  setShowNewPosterModal(false)
                  setNewPoster({ title: '', description: '', file: null })
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✓ Freigabe erteilen</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">{selectedItem.title}</h3>
              <p className="text-sm text-gray-600">{selectedItem.description}</p>
            </div>
            <p className="text-gray-700 mb-6">
              Möchten Sie dieses Material freigeben? Nach der Freigabe kann es versendet werden.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleApprovePoster(selectedItem.id)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Freigeben
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false)
                  setSelectedItem(null)
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📤 Material versenden</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">{selectedItem.title}</h3>
              {selectedItem.description && <p className="text-sm text-gray-600">{selectedItem.description}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Versenden an:</label>
              <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                {mockRecipients.map(recipient => (
                  <label key={recipient} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendTo.includes(recipient)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSendTo([...sendTo, recipient])
                        } else {
                          setSendTo(sendTo.filter(r => r !== recipient))
                        }
                      }}
                      className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">{recipient}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {sendTo.length === 0 ? 'Mindestens einen Empfänger auswählen' : `${sendTo.length} Empfänger ausgewählt`}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSendMaterial}
                disabled={sendTo.length === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Jetzt versenden
              </button>
              <button
                onClick={() => {
                  setShowSendModal(false)
                  setSelectedItem(null)
                  setSendTo([])
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

