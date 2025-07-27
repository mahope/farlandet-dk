import { z } from 'zod'

// Define ResourceType locally to avoid circular imports
type ResourceType = 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series'

// Resource submission validation schema
export const resourceSubmissionSchema = z.object({
  title: z
    .string()
    .min(5, 'Titel skal være mindst 5 tegn')
    .max(255, 'Titel må ikke være længere end 255 tegn'),
  description: z
    .string()
    .max(2000, 'Beskrivelse må ikke være længere end 2000 tegn')
    .optional(),
  resourceType: z.enum(['link', 'pdf', 'article', 'podcast', 'tip', 'book', 'video', 'movie', 'tv_series'] as const),
  categoryId: z
    .string()
    .min(1, 'Vælg venligst en kategori'),
  tags: z
    .array(z.string())
    .min(1, 'Tilføj mindst ét tag'),
  url: z
    .string()
    .url('Ugyldig URL format')
    .optional()
    .or(z.literal('')),
  submitterEmail: z
    .string()
    .email('Ugyldig email adresse')
    .optional()
    .or(z.literal('')),
  // Resource type specific fields
  bookDetails: z.object({
    author: z.string().optional(),
    isbn: z.string().optional(),
    publishYear: z.number().optional(),
    publisher: z.string().optional(),
    purchaseLinks: z.array(z.string().url()).optional(),
  }).optional(),
  videoDetails: z.object({
    duration: z.number().optional(),
    channel: z.string().optional(),
    platform: z.enum(['youtube', 'vimeo', 'other']).optional(),
    embedId: z.string().optional(),
  }).optional(),
  movieDetails: z.object({
    director: z.string().optional(),
    releaseYear: z.number().optional(),
    genre: z.array(z.string()).optional(),
    imdbId: z.string().optional(),
    streamingPlatforms: z.array(z.string()).optional(),
    rating: z.string().optional(),
  }).optional(),
  articleDetails: z.object({
    author: z.string().optional(),
    publication: z.string().optional(),
    publishDate: z.string().optional(),
    readingTime: z.number().optional(),
  }).optional(),
  podcastDetails: z.object({
    host: z.string().optional(),
    episodeNumber: z.number().optional(),
    duration: z.number().optional(),
    platform: z.string().optional(),
  }).optional(),
}).refine((data) => {
  // Validate that URL is required for non-tip, non-pdf resource types
  if (['link', 'article', 'podcast', 'book', 'video', 'movie', 'tv_series'].includes(data.resourceType)) {
    return data.url && data.url.length > 0
  }
  return true
}, {
  message: 'URL er påkrævet for denne ressourcetype',
  path: ['url'],
})

export type ResourceSubmissionFormData = z.infer<typeof resourceSubmissionSchema>

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Fil må ikke være større end 10MB')
    .refine((file) => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type), 
      'Kun PDF, JPEG, PNG og WebP filer er tilladt')
    .optional(),
})

export type FileUploadData = z.infer<typeof fileUploadSchema>

// Resource type configurations
export const resourceTypeConfig = {
  link: {
    label: 'Link',
    description: 'Et link til en hjemmeside eller online ressource',
    requiresUrl: true,
    allowsFile: false,
    icon: '🔗',
  },
  pdf: {
    label: 'PDF',
    description: 'Et PDF dokument',
    requiresUrl: false,
    allowsFile: true,
    icon: '📄',
  },
  article: {
    label: 'Artikel',
    description: 'En artikel eller blog post',
    requiresUrl: true,
    allowsFile: false,
    icon: '📰',
  },
  podcast: {
    label: 'Podcast',
    description: 'En podcast episode',
    requiresUrl: true,
    allowsFile: false,
    icon: '🎧',
  },
  tip: {
    label: 'Tip',
    description: 'Et tip eller trick',
    requiresUrl: false,
    allowsFile: false,
    icon: '💡',
  },
  book: {
    label: 'Bog',
    description: 'En bog eller e-bog',
    requiresUrl: true,
    allowsFile: false,
    icon: '📚',
  },
  video: {
    label: 'Video',
    description: 'En video (YouTube, Vimeo, etc.)',
    requiresUrl: true,
    allowsFile: false,
    icon: '🎥',
  },
  movie: {
    label: 'Film',
    description: 'En film',
    requiresUrl: true,
    allowsFile: false,
    icon: '🍿',
  },
  tv_series: {
    label: 'TV-serie',
    description: 'En TV-serie',
    requiresUrl: true,
    allowsFile: false,
    icon: '📺',
  },
} as const