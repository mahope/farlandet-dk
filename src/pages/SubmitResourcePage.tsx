import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from '@/components/layout/Layout'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { TagInput } from '../components/TagInput'
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
  Sparkles,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Resource types that require URL
const URL_REQUIRED_TYPES = ['link', 'article', 'podcast', 'video', 'movie', 'tv_series'] as const
const URL_OPTIONAL_TYPES = ['book', 'tip'] as const
const ALL_TYPES = [...URL_REQUIRED_TYPES, ...URL_OPTIONAL_TYPES] as const

type ResourceType = typeof ALL_TYPES[number]

// Zod schema with conditional URL validation
const resourceSchema = z.object({
  type: z.enum(ALL_TYPES),
  title: z
    .string()
    .min(5, 'Titel skal være mindst 5 tegn')
    .max(255, 'Titel må højst være 255 tegn'),
  description: z
    .string()
    .min(10, 'Beskrivelse skal være mindst 10 tegn')
    .max(2000, 'Beskrivelse må højst være 2000 tegn'),
  url: z.string().optional(),
  submitter_email: z
    .string()
    .email('Ugyldig email adresse')
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().max(50, 'Tag må højst være 50 tegn'))
    .max(10, 'Maksimalt 10 tags')
}).refine(
  (data) => {
    // URL required for certain types
    if (URL_REQUIRED_TYPES.includes(data.type as typeof URL_REQUIRED_TYPES[number])) {
      if (!data.url || data.url.trim() === '') {
        return false
      }
      // Basic URL validation
      try {
        new URL(data.url)
        return true
      } catch {
        return false
      }
    }
    // URL optional for other types - if provided, must be valid
    if (data.url && data.url.trim() !== '') {
      try {
        new URL(data.url)
        return true
      } catch {
        return false
      }
    }
    return true
  },
  {
    message: 'Ugyldig eller manglende URL',
    path: ['url']
  }
)

type ResourceFormData = z.infer<typeof resourceSchema>

const resourceTypes: Array<{
  value: ResourceType
  label: string
  icon: typeof LinkIcon
  description: string
  urlHint: string
  requiresUrl: boolean
}> = [
  {
    value: 'link',
    label: 'Link/Website',
    icon: LinkIcon,
    description: 'Hjemmesider, artikler, blogs',
    urlHint: 'Indsæt URL til hjemmesiden eller artiklen',
    requiresUrl: true
  },
  {
    value: 'article',
    label: 'Artikel',
    icon: FileText,
    description: 'Nyhedsartikler, guides, tutorials',
    urlHint: 'Link til artiklen online',
    requiresUrl: true
  },
  {
    value: 'podcast',
    label: 'Podcast',
    icon: Headphones,
    description: 'Podcast episoder eller serier',
    urlHint: 'Link til Spotify, Apple Podcasts eller anden platform',
    requiresUrl: true
  },
  {
    value: 'book',
    label: 'Bog',
    icon: BookOpen,
    description: 'Bøger, e-bøger, audiobooks',
    urlHint: 'Link til forlag, bibliotek eller boghandel (valgfrit)',
    requiresUrl: false
  },
  {
    value: 'video',
    label: 'Video',
    icon: Video,
    description: 'YouTube, Vimeo, uddannelsesvideoer',
    urlHint: 'Link til videoen på YouTube, Vimeo etc.',
    requiresUrl: true
  },
  {
    value: 'movie',
    label: 'Film',
    icon: Film,
    description: 'Dokumentarer, film til fædre',
    urlHint: 'Link til streaming-tjeneste eller filmside',
    requiresUrl: true
  },
  {
    value: 'tv_series',
    label: 'TV Serie',
    icon: Tv,
    description: 'TV serier, miniserier',
    urlHint: 'Link til streaming-tjeneste eller serieside',
    requiresUrl: true
  },
  {
    value: 'tip',
    label: 'Tip & Trick',
    icon: Lightbulb,
    description: 'Praktiske råd og tips',
    urlHint: 'Intet link nødvendigt - del dit bedste råd',
    requiresUrl: false
  }
]

export function SubmitResourcePage() {
  useSEO({
    title: 'Indsend Ressource - Farlandet.dk',
    description: 'Del en ressource med Farlandet.dk fællesskabet. Upload links, PDFer, podcasts, artikler og meget mere.',
    keywords: ['indsend ressource', 'del link', 'upload pdf', 'fællesskab bidrag'],
    url: 'https://farlandet.dk/submit',
    type: 'website'
  })

  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<ResourceFormData | null>(null)
  const [serverError, setServerError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid, dirtyFields, touchedFields }
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: 'link',
      title: '',
      description: '',
      url: '',
      submitter_email: '',
      tags: []
    },
    mode: 'onChange'
  })

  const watchedType = watch('type')
  const watchedTitle = watch('title')
  const watchedDescription = watch('description')

  const selectedType = resourceTypes.find(t => t.value === watchedType)
  const urlRequired = selectedType?.requiresUrl ?? true

  // Calculate progress
  const requiredFieldsFilled = [
    watchedTitle?.length >= 5,
    watchedDescription?.length >= 10,
    !urlRequired || (watch('url')?.length ?? 0) > 0
  ].filter(Boolean).length
  const totalRequiredFields = urlRequired ? 3 : 2

  const onSubmit = async (data: ResourceFormData) => {
    setServerError('')

    try {
      // Sanitize form data before submission
      const sanitizedData = {
        title: DOMPurify.sanitize(data.title.trim()),
        description: DOMPurify.sanitize(data.description.trim()),
        url: data.url?.trim() || '',
        type: data.type,
        submitter_email: data.submitter_email ? DOMPurify.sanitize(data.submitter_email.trim()) : '',
        tags: data.tags.map(tag => DOMPurify.sanitize(tag.trim())).filter(Boolean)
      }

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
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
          }

          return result
        },
        { component: 'SubmitResourcePage' }
      )

      if (result.success) {
        setSubmittedData(data)
        setSubmitted(true)
        logger.info('Resource submitted successfully', {
          component: 'SubmitResourcePage',
          action: 'form_submit_success',
          resourceId: result.data?.id
        })
      } else {
        const errorMessage = result.error || 'Der opstod en fejl ved indsendelse'
        setServerError(errorMessage)
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
        if (err.message.includes('HTTP 400')) {
          errorMessage = 'Valideringsfejl. Tjek dine indtastninger.'
        } else if (err.message.includes('HTTP 429')) {
          errorMessage = 'For mange forsøg. Vent lidt og prøv igen.'
        } else if (err.message.includes('HTTP 500')) {
          errorMessage = 'Serverfejl. Prøv igen senere.'
        } else if (!err.message.includes('HTTP')) {
          errorMessage = err.message
        }
      }

      setServerError(errorMessage)
      logger.error('Resource submission network error', err as Error, {
        component: 'SubmitResourcePage',
        action: 'form_submit_network_error',
        errorMessage
      })
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setSubmittedData(null)
    reset()
  }

  // Field validation helper
  const getFieldState = (fieldName: keyof ResourceFormData) => {
    const hasError = !!errors[fieldName]
    const isTouched = touchedFields[fieldName]
    const isDirty = dirtyFields[fieldName]
    const value = watch(fieldName)

    // Only show success if field is touched/dirty and has valid content
    let isValid = false
    if (fieldName === 'title') {
      isValid = typeof value === 'string' && value.length >= 5 && value.length <= 255
    } else if (fieldName === 'description') {
      isValid = typeof value === 'string' && value.length >= 10 && value.length <= 2000
    } else if (fieldName === 'url') {
      if (!urlRequired && (!value || value === '')) {
        isValid = true
      } else if (typeof value === 'string' && value.length > 0) {
        try {
          new URL(value)
          isValid = true
        } catch {
          isValid = false
        }
      }
    } else if (fieldName === 'submitter_email') {
      isValid = !value || value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)
    }

    return {
      hasError,
      isTouched,
      isDirty,
      showSuccess: (isTouched || isDirty) && isValid && !hasError,
      showError: hasError && (isTouched || isDirty)
    }
  }

  if (submitted && submittedData) {
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
                <CardContent className="space-y-6">
                  {/* Preview of submitted resource */}
                  <div className="bg-muted/50 rounded-lg p-4 text-left">
                    <p className="text-sm text-muted-foreground mb-2">Din indsendelse:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {selectedType && <selectedType.icon className="h-4 w-4 text-primary" />}
                        <span className="font-medium text-foreground">{submittedData.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {submittedData.description}
                      </p>
                      {submittedData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {submittedData.tags.map(tag => (
                            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

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
                    <Button onClick={handleReset}>
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

              {/* Progress indicator */}
              <div className="mt-6 inline-flex items-center gap-2 bg-background border rounded-full px-4 py-2 text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(totalRequiredFields)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        i < requiredFieldsFilled ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {requiredFieldsFilled} af {totalRequiredFields} påkrævede felter
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Resource Type Selection - FIRST */}
              <Card className="border-0 shadow-lg animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-foreground">1. Vælg type af ressource</CardTitle>
                  <CardDescription>
                    Dette bestemmer hvilke felter der er påkrævet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {resourceTypes.map((type) => (
                      <label
                        key={type.value}
                        className={cn(
                          'flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                          watchedType === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        )}
                      >
                        <input
                          type="radio"
                          {...register('type')}
                          value={type.value}
                          className="sr-only"
                        />
                        <type.icon className={cn(
                          'h-6 w-6 mb-2',
                          watchedType === type.value ? 'text-primary' : 'text-muted-foreground'
                        )} />
                        <span className={cn(
                          'font-medium text-sm text-center',
                          watchedType === type.value ? 'text-primary' : 'text-foreground'
                        )}>
                          {type.label}
                        </span>
                        {!type.requiresUrl && (
                          <span className="text-xs text-muted-foreground mt-1">
                            Intet link krævet
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <Card className="border-0 shadow-lg animate-fade-in">
                    <CardHeader>
                      <CardTitle className="text-foreground">2. Grundlæggende information</CardTitle>
                      <CardDescription>
                        Fortæl os om den ressource du vil dele
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Title */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="title" className="text-sm font-medium text-foreground">
                            Titel *
                          </Label>
                          <span className={cn(
                            'text-xs',
                            (watchedTitle?.length ?? 0) > 200 ? 'text-amber-600' : 'text-muted-foreground',
                            (watchedTitle?.length ?? 0) > 255 && 'text-destructive'
                          )}>
                            {watchedTitle?.length ?? 0}/255 tegn
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            id="title"
                            {...register('title')}
                            placeholder="F.eks. '10 aktiviteter for far og barn i regnvejr'"
                            className={cn(
                              'pr-10',
                              getFieldState('title').showError && 'border-destructive focus-visible:ring-destructive',
                              getFieldState('title').showSuccess && 'border-green-500 focus-visible:ring-green-500'
                            )}
                          />
                          {getFieldState('title').showSuccess && (
                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {errors.title && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      {/* URL - Dynamic based on type */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="url" className="text-sm font-medium text-foreground">
                            URL/Link {urlRequired ? '*' : '(valgfrit)'}
                          </Label>
                        </div>
                        <div className="relative">
                          <Input
                            id="url"
                            type="url"
                            {...register('url')}
                            placeholder={selectedType?.urlHint || 'https://...'}
                            className={cn(
                              'pr-10',
                              getFieldState('url').showError && 'border-destructive focus-visible:ring-destructive',
                              getFieldState('url').showSuccess && watch('url') && 'border-green-500 focus-visible:ring-green-500'
                            )}
                          />
                          {getFieldState('url').showSuccess && watch('url') && (
                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {errors.url && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.url.message}
                          </p>
                        )}
                        {!urlRequired && !errors.url && (
                          <p className="text-xs text-muted-foreground">
                            {selectedType?.urlHint}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="description" className="text-sm font-medium text-foreground">
                            Beskrivelse *
                          </Label>
                          <span className={cn(
                            'text-xs',
                            (watchedDescription?.length ?? 0) > 1800 ? 'text-amber-600' : 'text-muted-foreground',
                            (watchedDescription?.length ?? 0) > 2000 && 'text-destructive'
                          )}>
                            {watchedDescription?.length ?? 0}/2000 tegn
                          </span>
                        </div>
                        <div className="relative">
                          <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Beskriv ressourcen og hvorfor den er værdifuld for andre fædre..."
                            rows={4}
                            className={cn(
                              getFieldState('description').showError && 'border-destructive focus-visible:ring-destructive',
                              getFieldState('description').showSuccess && 'border-green-500 focus-visible:ring-green-500'
                            )}
                          />
                        </div>
                        {errors.description && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Server Error */}
                  {serverError && (
                    <Card className="border-destructive/20 bg-destructive/5 animate-scale-in">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{serverError}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Tags */}
                  <Card className="border-0 shadow-lg animate-fade-in">
                    <CardHeader>
                      <CardTitle className="text-foreground">3. Tags</CardTitle>
                      <CardDescription>
                        Hjælper andre med at finde indholdet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                          <TagInput
                            value={field.value}
                            onChange={field.onChange}
                            maxTags={10}
                            placeholder="Søg efter tags..."
                            error={errors.tags?.message}
                          />
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Email */}
                  <Card className="border-0 shadow-lg animate-fade-in">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-foreground text-base">Din email (valgfrit)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        id="submitter_email"
                        type="email"
                        {...register('submitter_email')}
                        placeholder="din@email.dk"
                        className={cn(
                          errors.submitter_email && 'border-destructive focus-visible:ring-destructive'
                        )}
                      />
                      {errors.submitter_email ? (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.submitter_email.message}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Kun hvis du vil kontaktes ved spørgsmål
                        </p>
                      )}
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
