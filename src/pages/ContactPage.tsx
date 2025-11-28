import React, { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Link } from 'react-router-dom'
import { Mail, MessageCircle, HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react'

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const contactCategories = [
    { value: 'support', label: 'Teknisk support', icon: HelpCircle },
    { value: 'content', label: 'Spørgsmål om indhold', icon: MessageCircle },
    { value: 'report', label: 'Rapporter problem', icon: AlertTriangle },
    { value: 'feedback', label: 'Feedback og forslag', icon: Mail },
    { value: 'privacy', label: 'Privatlivs-spørgsmål', icon: Mail },
    { value: 'other', label: 'Andet', icon: Mail }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Tak for din henvendelse!</h1>
          <p className="text-muted-foreground mb-6">
            Vi har modtaget din besked og vil svare så hurtigt som muligt.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Hvad sker der nu?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Du modtager en bekræftelse på din email</li>
                <li>• Vi gennemgår din henvendelse</li>
                <li>• Vi kontakter dig inden for 1-2 arbejdsdage</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => {
                setSubmitted(false)
                setFormData({
                  name: '',
                  email: '',
                  subject: '',
                  category: '',
                  message: ''
                })
              }}>
                Send en ny besked
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">
                  Tilbage til forsiden
                </Link>
              </Button>
            </div>
          </div>
        </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Kontakt os</h1>
        <p className="text-muted-foreground">
          Har du spørgsmål, feedback eller brug for hjælp? Vi er her for at hjælpe. 
          Vælg den kategori der bedst beskriver din henvendelse.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Kategori</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contactCategories.map(category => {
                  const IconComponent = category.icon
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        formData.category === category.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <IconComponent className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Navn
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Dit fulde navn"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="din@email.dk"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="text-sm font-medium mb-2 block">
                Emne
              </label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                placeholder="Kort beskrivelse af dit spørgsmål"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="text-sm font-medium mb-2 block">
                Besked
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Beskriv dit spørgsmål eller feedback i detaljer..."
              />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sender...' : 'Send besked'}
            </Button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-4">Ofte stillede spørgsmål</h3>
            <div className="space-y-3 text-sm">
              <Link to="/guidelines" className="block text-muted-foreground hover:text-foreground">
                • Hvordan bidrage med indhold?
              </Link>
              <Link to="/privacy" className="block text-muted-foreground hover:text-foreground">
                • Hvordan bruges mine data?
              </Link>
              <Link to="/support" className="block text-muted-foreground hover:text-foreground">
                • Tekniske problemer
              </Link>
            </div>
          </div>

          {/* Response Times */}
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-4">Svartider</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Support:</span>
                <span>1-2 dage</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Feedback:</span>
                <span>3-5 dage</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rapporter:</span>
                <span>Samme dag</span>
              </div>
            </div>
          </div>

          {/* Alternative Contact */}
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-4">Andre måder</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Email:</strong><br />
                <span className="text-muted-foreground">support@danishfathersdirectory.dk</span>
              </div>
              <div>
                <strong>Akut support:</strong><br />
                <span className="text-muted-foreground">Brug kontaktformularen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}