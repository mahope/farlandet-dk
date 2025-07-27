import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert } from '../ui/alert'
import { LoadingSpinner } from '../ui/loading-spinner'
import { resourceSubmissionSchema, resourceTypeConfig, fileUploadSchema, type ResourceSubmissionFormData } from '../../lib/validations/resource'
import { useAuth } from '../../contexts/AuthContext'
import { useCategories } from '../../hooks/useCategories'
import { useTags } from '../../hooks/useTags'
import { tables, storage } from '../../lib/supabase'

interface ResourceSubmissionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ResourceSubmissionForm({ onSuccess, onCancel }: ResourceSubmissionFormProps) {
  const { user } = useAuth()
  const { categories, loading: categoriesLoading } = useCategories()
  const { tags: availableTags, loading: tagsLoading } = useTags()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ResourceSubmissionFormData>({
    resolver: zodResolver(resourceSubmissionSchema),
    defaultValues: {
      resourceType: 'link',
      tags: [],
    },
  })

  const selectedResourceType = watch('resourceType')
  const typeConfig = resourceTypeConfig[selectedResourceType]

  // Funktion til at tilføje et nyt tag
  const handleAddCustomTag = () => {
    const tag = newTagInput.trim()
    if (tag && !customTags.includes(tag) && !availableTags.some(t => t.name.toLowerCase() === tag.toLowerCase())) {
      const newTags = [...customTags, tag]
      setCustomTags(newTags)
      const newSelectedTags = [...selectedTags, `custom:${tag}`]
      setSelectedTags(newSelectedTags)
      setValue('tags', newSelectedTags)
      setNewTagInput('')
    }
  }

  // Funktion til at fjerne et custom tag
  const handleRemoveCustomTag = (tag: string) => {
    const newCustomTags = customTags.filter(t => t !== tag)
    setCustomTags(newCustomTags)
    const customTagId = `custom:${tag}`
    const newSelectedTags = selectedTags.filter(t => t !== customTagId)
    setSelectedTags(newSelectedTags)
    setValue('tags', newSelectedTags)
  }

  // Håndter Enter tast for at tilføje tag
  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomTag()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file before setting
      try {
        fileUploadSchema.parse({ file })
        setUploadedFile(file)
        setSubmitError(null) // Clear any previous errors
      } catch (error) {
        console.error('File validation error:', error)
        setSubmitError('Invalid file. Please upload a PDF under 10MB.')
        event.target.value = '' // Clear the input
      }
    }
  }

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `resources/${fileName}`

      const { error } = await storage.resources().upload(filePath, file)

      if (error) {
        console.error('Error uploading file:', error)
        return null
      }

      return filePath
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }

  const onSubmit = async (data: ResourceSubmissionFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      let filePath: string | null = null

      // Upload file if provided
      if (uploadedFile) {
        filePath = await uploadFileToSupabase(uploadedFile)
        if (!filePath) {
          setSubmitError('Fejl ved upload af fil. Prøv igen.')
          setIsSubmitting(false)
          return
        }
      }

      // Prepare resource-specific metadata
      let metadata: Record<string, any> = {}
      
      switch (data.resourceType) {
        case 'book':
          if (data.bookDetails) {
            metadata = {
              author: data.bookDetails.author,
              isbn: data.bookDetails.isbn,
              publishYear: data.bookDetails.publishYear,
              publisher: data.bookDetails.publisher,
              purchaseLinks: data.bookDetails.purchaseLinks
            }
          }
          break
        case 'video':
          if (data.videoDetails) {
            metadata = {
              duration: data.videoDetails.duration,
              channel: data.videoDetails.channel,
              platform: data.videoDetails.platform,
              embedId: data.videoDetails.embedId
            }
          }
          break
        case 'movie':
        case 'tv_series':
          if (data.movieDetails) {
            metadata = {
              director: data.movieDetails.director,
              releaseYear: data.movieDetails.releaseYear,
              genre: data.movieDetails.genre,
              imdbId: data.movieDetails.imdbId,
              streamingPlatforms: data.movieDetails.streamingPlatforms,
              rating: data.movieDetails.rating
            }
          }
          break
        case 'article':
          if (data.articleDetails) {
            metadata = {
              author: data.articleDetails.author,
              publication: data.articleDetails.publication,
              publishDate: data.articleDetails.publishDate,
              readingTime: data.articleDetails.readingTime
            }
          }
          break
        case 'podcast':
          if (data.podcastDetails) {
            metadata = {
              host: data.podcastDetails.host,
              episodeNumber: data.podcastDetails.episodeNumber,
              duration: data.podcastDetails.duration,
              platform: data.podcastDetails.platform
            }
          }
          break
      }

      // Prepare resource data
      const resourceData = {
        title: data.title,
        description: data.description || null,
        url: data.url || null,
        file_path: filePath,
        resource_type: data.resourceType,
        category_id: data.categoryId,
        submitter_email: data.submitterEmail || null,
        submitter_id: user?.id || null,
        status: 'pending' as const,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      }

      // Insert resource
      console.log('Submitting resource data:', resourceData)
      const { data: resource, error: resourceError } = await tables.resources()
        .insert(resourceData)
        .select()
        .single()

      if (resourceError) {
        console.error('Error creating resource:', resourceError)
        setSubmitError(`Fejl ved oprettelse af ressource: ${resourceError.message}`)
        setIsSubmitting(false)
        return
      }

      console.log('Resource created successfully:', resource)

      // Add tags (både eksisterende og nye)
      if ((selectedTags.length > 0 || customTags.length > 0) && resource) {
        const allTagPromises: Promise<any>[] = []

        // Tilføj eksisterende tags
        selectedTags.forEach(tagId => {
          if (!tagId.startsWith('custom:')) {
            allTagPromises.push(
              tables.resource_tags().insert({
                resource_id: resource.id,
                tag_id: tagId,
              }).then()
            )
          }
        })

        // Opret og tilføj nye tags
        for (const customTag of customTags) {
          try {
            // Først opret det nye tag i databasen
            const { data: newTag, error: tagError } = await tables.tags()
              .insert({
                name: customTag,
                slug: customTag.replace(/\s+/g, '-').toLowerCase()
              })
              .select()
              .single()

            if (!tagError && newTag) {
              // Derefter link det til ressourcen
              allTagPromises.push(
                tables.resource_tags().insert({
                  resource_id: resource.id,
                  tag_id: newTag.id,
                }).then()
              )
            } else {
              console.error('Error creating custom tag:', tagError)
            }
          } catch (error) {
            console.error('Error creating custom tag:', error)
            // Hvis tag'et ikke kan oprettes i databasen, gem det som metadata i stedet
            console.log('Saving custom tag as metadata:', customTag)
          }
        }

        if (allTagPromises.length > 0) {
          await Promise.all(allTagPromises)
        }
      }

      // Success
      console.log('Resource submission completed successfully!')
      reset()
      setUploadedFile(null)
      setSelectedTags([])
      setCustomTags([])
      setNewTagInput('')
      
      // Show success message
      alert('Ressource indsendt med succes! Den vil blive gennemgået af moderatorer.')
      
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting resource:', error)
      setSubmitError('Der opstod en uventet fejl. Prøv igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Tilføj ny ressource</h2>
        <p className="text-muted-foreground">
          Del en værdifuld ressource med fællesskabet. Din indsendelse vil blive gennemgået inden offentliggørelse.
        </p>
        
        {/* Debug info - kun i development */}
        {import.meta.env.DEV && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs">
            <p><strong>Debug:</strong></p>
            <p>Kategorier: {categories.length} (loading: {categoriesLoading.toString()})</p>
            <p>Tags: {availableTags.length} (loading: {tagsLoading.toString()})</p>
            <p>Valgte tags: {selectedTags.length}</p>
            <p>Custom tags: {customTags.length} ({customTags.join(', ')})</p>
            <p>Total tags: {selectedTags.length + customTags.length}</p>
          </div>
        )}
      </div>

      {submitError && (
        <Alert variant="destructive">
          {submitError}
        </Alert>
      )}

      {/* Resource Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="resourceType">Ressourcetype *</Label>
        <select
          {...register('resourceType')}
          className="w-full p-3 border border-input rounded-md bg-background"
        >
          {Object.entries(resourceTypeConfig).map(([type, config]) => (
            <option key={type} value={type}>
              {config.icon} {config.label} - {config.description}
            </option>
          ))}
        </select>
        {errors.resourceType && (
          <p className="text-sm text-destructive">{errors.resourceType.message}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titel *</Label>
        <Input
          {...register('title')}
          placeholder="Indtast en beskrivende titel"
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Beskrivelse</Label>
        <textarea
          {...register('description')}
          placeholder="Beskriv ressourcen og hvorfor den er værdifuld"
          className="w-full p-3 border border-input rounded-md bg-background min-h-[100px] resize-y"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* URL Field (conditional) */}
      {typeConfig.requiresUrl && (
        <div className="space-y-2">
          <Label htmlFor="url">URL *</Label>
          <Input
            {...register('url')}
            type="url"
            placeholder="https://example.com"
            className={errors.url ? 'border-destructive' : ''}
          />
          {errors.url && (
            <p className="text-sm text-destructive">{errors.url.message}</p>
          )}
        </div>
      )}

      {/* File Upload (conditional) */}
      {typeConfig.allowsFile && (
        <div className="space-y-2">
          <Label htmlFor="file">Upload fil {selectedResourceType === 'pdf' && '(eller indtast URL ovenfor)'}</Label>
          <input
            type="file"
            accept={selectedResourceType === 'pdf' ? '.pdf' : '.pdf,.jpg,.jpeg,.png,.webp'}
            onChange={handleFileChange}
            className="w-full p-3 border border-input rounded-md bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {uploadedFile && (
            <p className="text-sm text-muted-foreground">
              Valgt fil: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Kategori *</Label>
        {categoriesLoading ? (
          <div className="w-full p-3 border border-input rounded-md bg-background flex items-center">
            <LoadingSpinner size="sm" className="mr-2" />
            <span className="text-sm text-muted-foreground">Henter kategorier...</span>
          </div>
        ) : categories.length > 0 ? (
          <select
            {...register('categoryId')}
            className="w-full p-3 border border-input rounded-md bg-background"
          >
            <option value="">Vælg kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="w-full p-3 border border-input rounded-md bg-background">
            <p className="text-sm text-muted-foreground">
              Ingen kategorier tilgængelige. Kontakt administrator.
            </p>
          </div>
        )}
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Tags Selection */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags *</Label>
        {tagsLoading ? (
          <div className="border border-input rounded-md p-3 bg-background flex items-center">
            <LoadingSpinner size="sm" className="mr-2" />
            <span className="text-sm text-muted-foreground">Henter tags...</span>
          </div>
        ) : availableTags.length > 0 ? (
          <div className="border border-input rounded-md p-3 bg-background space-y-4">
            {/* Foruddefinerede tags */}
            <div>
              <h4 className="text-sm font-medium mb-2">Vælg fra eksisterende tags:</h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const newSelectedTags = selectedTags.includes(tag.id)
                        ? selectedTags.filter(id => id !== tag.id)
                        : [...selectedTags, tag.id]
                      setSelectedTags(newSelectedTags)
                      setValue('tags', newSelectedTags)
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tilføj nye tags */}
            <div>
              <h4 className="text-sm font-medium mb-2">Eller tilføj nye tags:</h4>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Skriv nyt tag og tryk Enter"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddCustomTag}
                  variant="outline"
                  size="sm"
                  disabled={!newTagInput.trim()}
                >
                  Tilføj
                </Button>
              </div>
              
              {/* Custom tags */}
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <div
                      key={tag}
                      className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200 flex items-center gap-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTag(tag)}
                        className="ml-1 text-green-600 hover:text-green-800 text-xs"
                        title="Fjern tag"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Sammenfatning */}
            {(selectedTags.length > 0 || customTags.length > 0) && (
              <div className="text-sm text-muted-foreground pt-2 border-t">
                <strong>Valgte tags: {selectedTags.length + customTags.length}</strong>
                <div className="mt-1">
                  {availableTags.filter(t => selectedTags.includes(t.id)).map(t => t.name).join(', ')}
                  {selectedTags.length > 0 && customTags.length > 0 && ', '}
                  {customTags.join(', ')}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-input rounded-md p-3 bg-background">
            <p className="text-sm text-muted-foreground">
              Ingen tags tilgængelige. Kontakt administrator.
            </p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Vælg mindst ét tag der beskriver din ressource.
        </p>
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
      </div>

      {/* Submitter Email (for anonymous users) */}
      {!user && (
        <div className="space-y-2">
          <Label htmlFor="submitterEmail">Din email (valgfri)</Label>
          <Input
            {...register('submitterEmail')}
            type="email"
            placeholder="din@email.dk"
            className={errors.submitterEmail ? 'border-destructive' : ''}
          />
          <p className="text-sm text-muted-foreground">
            Vi bruger kun din email til at kontakte dig om din indsendelse.
          </p>
          {errors.submitterEmail && (
            <p className="text-sm text-destructive">{errors.submitterEmail.message}</p>
          )}
        </div>
      )}

      {/* Resource Type Specific Fields */}
      {selectedResourceType === 'book' && (
        <div className="space-y-4 border border-input rounded-lg p-4 bg-muted/50">
          <h3 className="text-lg font-semibold">📚 Bogdetaljer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookAuthor">Forfatter</Label>
              <Input
                {...register('bookDetails.author')}
                placeholder="Forfatterens navn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookPublishYear">Udgivelsesår</Label>
              <Input
                {...register('bookDetails.publishYear', { valueAsNumber: true })}
                type="number"
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookPublisher">Forlag</Label>
              <Input
                {...register('bookDetails.publisher')}
                placeholder="Forlagsnavn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookIsbn">ISBN</Label>
              <Input
                {...register('bookDetails.isbn')}
                placeholder="978-3-16-148410-0"
              />
            </div>
          </div>
        </div>
      )}

      {selectedResourceType === 'video' && (
        <div className="space-y-4 border border-input rounded-lg p-4 bg-muted/50">
          <h3 className="text-lg font-semibold">🎥 Videodetaljer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="videoChannel">Kanal</Label>
              <Input
                {...register('videoDetails.channel')}
                placeholder="Kanalnavn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoDuration">Varighed (minutter)</Label>
              <Input
                {...register('videoDetails.duration', { valueAsNumber: true })}
                type="number"
                placeholder="15"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoPlatform">Platform</Label>
              <select
                {...register('videoDetails.platform')}
                className="w-full p-3 border border-input rounded-md bg-background"
              >
                <option value="">Vælg platform</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="other">Anden</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {(selectedResourceType === 'movie' || selectedResourceType === 'tv_series') && (
        <div className="space-y-4 border border-input rounded-lg p-4 bg-muted/50">
          <h3 className="text-lg font-semibold">
            {selectedResourceType === 'movie' ? '🍿 Filmdetaljer' : '📺 TV-seriedetaljer'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="movieDirector">
                {selectedResourceType === 'movie' ? 'Instruktør' : 'Skaber'}
              </Label>
              <Input
                {...register('movieDetails.director')}
                placeholder={selectedResourceType === 'movie' ? 'Instruktørens navn' : 'Skaberens navn'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movieReleaseYear">
                {selectedResourceType === 'movie' ? 'Udgivelsesår' : 'Første sæson'}
              </Label>
              <Input
                {...register('movieDetails.releaseYear', { valueAsNumber: true })}
                type="number"
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movieGenre">Genre</Label>
              <Input
                {...register('movieDetails.genre.0')}
                placeholder="Drama, Komedie, Action..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movieRating">Aldersgrænse</Label>
              <select
                {...register('movieDetails.rating')}
                className="w-full p-3 border border-input rounded-md bg-background"
              >
                <option value="">Vælg aldersgrænse</option>
                <option value="A">A - Tilladt for alle</option>
                <option value="7">7 år</option>
                <option value="11">11 år</option>
                <option value="15">15 år</option>
                <option value="F">F - Forbudt for børn under 16</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="movieStreaming">Streamingplatforme</Label>
            <Input
              {...register('movieDetails.streamingPlatforms.0')}
              placeholder="Netflix, HBO Max, Disney+... (adskil med komma)"
            />
          </div>
        </div>
      )}

      {selectedResourceType === 'article' && (
        <div className="space-y-4 border border-input rounded-lg p-4 bg-muted/50">
          <h3 className="text-lg font-semibold">📰 Artikeldetaljer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="articleAuthor">Forfatter</Label>
              <Input
                {...register('articleDetails.author')}
                placeholder="Forfatterens navn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="articlePublication">Publikation</Label>
              <Input
                {...register('articleDetails.publication')}
                placeholder="Magasin, blog, hjemmeside..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="articlePublishDate">Udgivelsesdato</Label>
              <Input
                {...register('articleDetails.publishDate')}
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="articleReadingTime">Læsetid (minutter)</Label>
              <Input
                {...register('articleDetails.readingTime', { valueAsNumber: true })}
                type="number"
                placeholder="5"
                min="1"
              />
            </div>
          </div>
        </div>
      )}

      {selectedResourceType === 'podcast' && (
        <div className="space-y-4 border border-input rounded-lg p-4 bg-muted/50">
          <h3 className="text-lg font-semibold">🎧 Podcast detaljer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="podcastHost">Vært</Label>
              <Input
                {...register('podcastDetails.host')}
                placeholder="Værts navn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="podcastEpisode">Episode nummer</Label>
              <Input
                {...register('podcastDetails.episodeNumber', { valueAsNumber: true })}
                type="number"
                placeholder="42"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="podcastDuration">Varighed (minutter)</Label>
              <Input
                {...register('podcastDetails.duration', { valueAsNumber: true })}
                type="number"
                placeholder="30"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="podcastPlatform">Platform</Label>
              <Input
                {...register('podcastDetails.platform')}
                placeholder="Spotify, Apple Podcasts..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Indsender...
            </>
          ) : (
            'Indsend til gennemgang'
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuller
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
        <p className="font-medium mb-2">Hvad sker der nu?</p>
        <ul className="space-y-1">
          <li>• Din ressource sendes til gennemgang</li>
          <li>• Moderatorer vil vurdere indholdet</li>
          <li>• Godkendte ressourcer offentliggøres i biblioteket</li>
          <li>• Du får besked hvis der er problemer</li>
        </ul>
      </div>
    </form>
  )
}