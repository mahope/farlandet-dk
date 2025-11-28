import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useSEO } from '../hooks/useSEO'
import { logger, measurePerformanceAsync } from '../utils/logger'
import DOMPurify from 'dompurify'
import { 
  BookOpen, 
  Link as LinkIcon, 
  FileText, 
  Headphones, 
  Lightbulb, 
  Video,
  Film,
  Tv,
  Send,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'

interface ResourceSubmission {
  title: string
  description: string
  url: string
  type: string
  submitter_email: string
  tags: string
}

export function SubmitResourcePage() {
  useSEO({
    title: 'Indsend Ressource - Farlandet.dk',
    description: 'Del en ressource med Farlandet.dk fællesskabet. Upload links, PDFer, podcasts, artikler og meget mere.',
    keywords: ['indsend ressource', 'del link', 'upload pdf', 'fællesskab bidrag'],
    url: 'https://farlandet.dk/submit',
    type: 'website'
  })

  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<ResourceSubmission>({
    title: '',
    description: '',
    url: '',
    type: 'link',
    submitter_email: '',
    tags: ''
  })

  const resourceTypes = [
    { value: 'link', label: 'Link/Website', icon: LinkIcon, description: 'Hjemmesider, artikler, blogs' },
    { value: 'article', label: 'Artikel', icon: FileText, description: 'Nyhedsartikler, guides, tutorials' },
    { value: 'podcast', label: 'Podcast', icon: Headphones, description: 'Podcast episoder eller serier' },
    { value: 'book', label: 'Bog', icon: BookOpen, description: 'Bøger, e-bøger, audiobooks' },
    { value: 'video', label: 'Video', icon: Video, description: 'YouTube, Vimeo, uddannelsesvideoer' },
    { value: 'movie', label: 'Film', icon: Film, description: 'Dokumentarer, film til fædre' },
    { value: 'tv_series', label: 'TV Serie', icon: Tv, description: 'TV serier, miniserier' },
    { value: 'tip', label: 'Tip & Trick', icon: Lightbulb, description: 'Praktiske råd og tips' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Sanitize form data before submission
      const sanitizedData = {
        title: DOMPurify.sanitize(formData.title.trim()),
        description: DOMPurify.sanitize(formData.description.trim()),
        url: formData.url.trim(),
        type: formData.type,
        submitter_email: formData.submitter_email ? DOMPurify.sanitize(formData.submitter_email.trim()) : '',
        tags: formData.tags.split(',').map(tag => DOMPurify.sanitize(tag.trim())).filter(Boolean)
      }

      // Log submission attempt (without sensitive data)
      logger.info('Resource submission attempt', {
        component: 'SubmitResourcePage',
        action: 'form_submit',
        resourceType: sanitizedData.type,
        hasEmail: !!sanitizedData.submitter_email,
        tagsCount: sanitizedData.tags.length
      })

      const result = await measurePerformanceAsync(
        'resource_submission',
        async () => {
          const response = await fetch('/api/resources', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedData),
          })

          const result = await response.json()

          if (!response.ok) {
            // Throw error with server's error message if available
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
          }

          return result
        },
        { component: 'SubmitResourcePage' }
      )

      if (result.success) {
        setSubmitted(true)
        logger.info('Resource submitted successfully', {
          component: 'SubmitResourcePage',
          action: 'form_submit_success',
          resourceId: result.data?.id
        })
      } else {
        const errorMessage = result.error || 'Der opstod en fejl ved indsendelse'
        setError(errorMessage)
        logger.warn('Resource submission failed', {
          component: 'SubmitResourcePage',
          action: 'form_submit_error', 
          error: errorMessage,
          details: result.details
        })
      }
    } catch (err) {
      let errorMessage = 'Netværksfejl. Prøv igen senere.'
      
      if (err instanceof Error) {
        // Try to extract actual error message from server response
        if (err.message.includes('HTTP 400')) {
          errorMessage = 'Valideringsfejl. Tjek dine indtastninger.'
        } else if (err.message.includes('HTTP 429')) {
          errorMessage = 'For mange forsøg. Vent lidt og prøv igen.'
        } else if (err.message.includes('HTTP 500')) {
          errorMessage = 'Serverfejl. Prøv igen senere.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      logger.error('Resource submission network error', err as Error, {
        component: 'SubmitResourcePage',
        action: 'form_submit_network_error',
        errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ResourceSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <Layout>
        <div className="bg-gradient-subtle py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-0 shadow-xl animate-scale-in">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-display-sm text-foreground mb-2">
                  Tak for dit bidrag!
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Din ressource er modtaget og vil blive gennemgået af vores moderatorer inden publicering.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/5 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Hvad sker der nu?</strong>
                  </p>
                  <ul className="space-y-1 text-left">
                    <li>• Vi gennemgår dit indhold for kvalitet og relevans</li>
                    <li>• Processen tager typisk 1-2 dage</li>
                    <li>• Du får besked hvis der er spørgsmål</li>
                  </ul>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={() => navigate('/')} variant="outline">
                    Tilbage til forsiden
                  </Button>
                  <Button onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      title: '',
                      description: '',
                      url: '',
                      type: 'link',
                      submitter_email: '',
                      tags: ''
                    })
                  }}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Bidrag med mere
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-gradient-subtle py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Bidrag til fællesskabet</span>
            </div>
            <h1 className="text-display-md font-bold text-foreground mb-4">
              Del en ressource
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hjælp andre danske fædre ved at dele værdifuldt indhold. Alt fra praktiske tips til inspirerende artikler.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-lg animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-foreground">Grundlæggende information</CardTitle>
                    <CardDescription>
                      Fortæl os om den ressource du vil dele
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-foreground">
                        Titel *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Hvad hedder ressourcen?"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="url" className="text-sm font-medium text-foreground">
                        URL/Link *
                      </Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        placeholder="https://..."
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-foreground">
                        Beskrivelse *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Beskriv ressourcen og hvorfor den er værdifuld for andre fædre..."
                        rows={4}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="submitter_email" className="text-sm font-medium text-foreground">
                        Din email
                      </Label>
                      <Input
                        id="submitter_email"
                        type="email"
                        value={formData.submitter_email}
                        onChange={(e) => handleInputChange('submitter_email', e.target.value)}
                        placeholder="din@email.dk (valgfrit)"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Kun hvis du vil kontaktes ved spørgsmål
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="tags" className="text-sm font-medium text-foreground">
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="forældreskab, aktiviteter, sundhed (kommasepareret)"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hjælper andre med at finde indholdet
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <Card className="border-destructive/20 bg-destructive/5 animate-scale-in">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Resource Type Selection */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-foreground">Type af ressource</CardTitle>
                    <CardDescription>
                      Vælg den kategori der passer bedst
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resourceTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          formData.type === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <type.icon className={`h-5 w-5 mt-0.5 ${
                          formData.type === type.value ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${
                            formData.type === type.value ? 'text-primary' : 'text-foreground'
                          }`}>
                            {type.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {type.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full group" 
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sender...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      Send ressource
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>
    </Layout>
  )
}