// ============================================================================
// Form Validation Schemas and Utilities
// ============================================================================

// Define types locally to avoid circular imports
export type ResourceType = 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series';

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
}

export interface CommentForm {
  content: string;
  resourceId: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface ResourceSubmissionForm {
  title: string;
  description: string;
  resourceType: ResourceType;
  categoryId: string;
  tags: string[];
  url?: string;
  file?: File;
  submitterEmail?: string;
}

// ============================================================================
// Validation Rules
// ============================================================================

export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Username must be 3-50 characters, letters, numbers, underscore, or dash only'
  },
  title: {
    required: true,
    minLength: 5,
    maxLength: 255,
    message: 'Title must be between 5 and 255 characters'
  },
  description: {
    maxLength: 2000,
    message: 'Description must be less than 2000 characters'
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL starting with http:// or https://'
  },
  comment: {
    required: true,
    minLength: 1,
    maxLength: 1000,
    message: 'Comment must be between 1 and 1000 characters'
  }
} as const

// ============================================================================
// Validation Functions
// ============================================================================

export function validateEmail(email: string): string[] {
  const errors: string[] = []
  
  if (!email.trim()) {
    errors.push('Email is required')
  } else if (!ValidationRules.email.pattern.test(email)) {
    errors.push(ValidationRules.email.message)
  }
  
  return errors
}

export function validatePassword(password: string): string[] {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Password is required')
  } else {
    if (password.length < ValidationRules.password.minLength) {
      errors.push(`Password must be at least ${ValidationRules.password.minLength} characters`)
    }
    if (!ValidationRules.password.pattern.test(password)) {
      errors.push(ValidationRules.password.message)
    }
  }
  
  return errors
}

export function validateUsername(username: string): string[] {
  const errors: string[] = []
  
  if (username && username.trim()) {
    if (username.length < ValidationRules.username.minLength) {
      errors.push(`Username must be at least ${ValidationRules.username.minLength} characters`)
    }
    if (username.length > ValidationRules.username.maxLength) {
      errors.push(`Username must be less than ${ValidationRules.username.maxLength} characters`)
    }
    if (!ValidationRules.username.pattern.test(username)) {
      errors.push(ValidationRules.username.message)
    }
  }
  
  return errors
}

export function validateTitle(title: string): string[] {
  const errors: string[] = []
  
  if (!title.trim()) {
    errors.push('Title is required')
  } else {
    if (title.length < ValidationRules.title.minLength) {
      errors.push(`Title must be at least ${ValidationRules.title.minLength} characters`)
    }
    if (title.length > ValidationRules.title.maxLength) {
      errors.push(`Title must be less than ${ValidationRules.title.maxLength} characters`)
    }
  }
  
  return errors
}

export function validateDescription(description: string): string[] {
  const errors: string[] = []
  
  if (description && description.length > ValidationRules.description.maxLength) {
    errors.push(ValidationRules.description.message)
  }
  
  return errors
}

export function validateUrl(url: string): string[] {
  const errors: string[] = []
  
  if (url && url.trim()) {
    if (!ValidationRules.url.pattern.test(url)) {
      errors.push(ValidationRules.url.message)
    }
  }
  
  return errors
}

export function validateComment(content: string): string[] {
  const errors: string[] = []
  
  if (!content.trim()) {
    errors.push('Comment cannot be empty')
  } else {
    if (content.length > ValidationRules.comment.maxLength) {
      errors.push(`Comment must be less than ${ValidationRules.comment.maxLength} characters`)
    }
  }
  
  return errors
}

export function validateFile(file: File | null, allowedTypes: string[], maxSize: number): string[] {
  const errors: string[] = []
  
  if (file) {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }
    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`)
    }
  }
  
  return errors
}

// ============================================================================
// Form Validation Schemas
// ============================================================================

export function validateLoginForm(data: LoginForm): ValidationResult {
  const errors: Record<string, string[]> = {}
  
  const emailErrors = validateEmail(data.email)
  if (emailErrors.length > 0) {
    errors.email = emailErrors
  }
  
  const passwordErrors = validatePassword(data.password)
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateRegisterForm(data: RegisterForm): ValidationResult {
  const errors: Record<string, string[]> = {}
  
  const emailErrors = validateEmail(data.email)
  if (emailErrors.length > 0) {
    errors.email = emailErrors
  }
  
  const passwordErrors = validatePassword(data.password)
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = ['Passwords do not match']
  }
  
  if (data.username) {
    const usernameErrors = validateUsername(data.username)
    if (usernameErrors.length > 0) {
      errors.username = usernameErrors
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateResourceSubmissionForm(data: ResourceSubmissionForm): ValidationResult {
  const errors: Record<string, string[]> = {}
  
  const titleErrors = validateTitle(data.title)
  if (titleErrors.length > 0) {
    errors.title = titleErrors
  }
  
  const descriptionErrors = validateDescription(data.description)
  if (descriptionErrors.length > 0) {
    errors.description = descriptionErrors
  }
  
  if (!data.categoryId) {
    errors.categoryId = ['Please select a category']
  }
  
  if (!data.tags || data.tags.length === 0) {
    errors.tags = ['Please add at least one tag']
  }
  
  // Validate resource type specific requirements
  if (data.resourceType === 'tip') {
    // Tips don't require URL or file
  } else if (['link', 'article', 'podcast', 'book', 'video', 'movie', 'tv_series'].includes(data.resourceType)) {
    if (!data.url) {
      errors.url = ['URL is required for this resource type']
    } else {
      const urlErrors = validateUrl(data.url)
      if (urlErrors.length > 0) {
        errors.url = urlErrors
      }
    }
  } else if (data.resourceType === 'pdf') {
    if (!data.file && !data.url) {
      errors.file = ['Please upload a PDF file or provide a URL']
    }
    if (data.file) {
      const fileErrors = validateFile(data.file, ['application/pdf'], 10 * 1024 * 1024) // 10MB
      if (fileErrors.length > 0) {
        errors.file = fileErrors
      }
    }
  }
  
  // Validate submitter email if provided
  if (data.submitterEmail) {
    const emailErrors = validateEmail(data.submitterEmail)
    if (emailErrors.length > 0) {
      errors.submitterEmail = emailErrors
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateCommentForm(data: CommentForm): ValidationResult {
  const errors: Record<string, string[]> = {}
  
  const contentErrors = validateComment(data.content)
  if (contentErrors.length > 0) {
    errors.content = contentErrors
  }
  
  if (!data.resourceId) {
    errors.resourceId = ['Resource ID is required']
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// ============================================================================
// File Upload Validation
// ============================================================================

export const FileUploadConfig = {
  pdf: {
    allowedTypes: ['application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    description: 'PDF files up to 10MB'
  },
  image: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'Images (JPEG, PNG, WebP, GIF) up to 5MB'
  },
  document: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    description: 'Documents (PDF, DOC, DOCX, TXT) up to 10MB'
  }
} as const

export function getFileUploadConfig(resourceType: ResourceType) {
  switch (resourceType) {
    case 'pdf':
      return FileUploadConfig.pdf
    case 'article':
    case 'tip':
      return FileUploadConfig.document
    default:
      return FileUploadConfig.image
  }
}

// ============================================================================
// URL Validation by Resource Type
// ============================================================================

export const UrlPatterns = {
  youtube: /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
  vimeo: /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
  podcast: /^https?:\/\/.+\.(mp3|wav|ogg|m4a)$/,
  general: /^https?:\/\/.+/
} as const

export function validateResourceUrl(url: string, resourceType: ResourceType): string[] {
  const errors: string[] = []
  
  if (!url.trim()) {
    return errors
  }
  
  const basicUrlErrors = validateUrl(url)
  if (basicUrlErrors.length > 0) {
    return basicUrlErrors
  }
  
  switch (resourceType) {
    case 'video':
      if (!UrlPatterns.youtube.test(url) && !UrlPatterns.vimeo.test(url) && !UrlPatterns.general.test(url)) {
        errors.push('Please provide a valid video URL (YouTube, Vimeo, or direct link)')
      }
      break
    case 'podcast':
      // Allow both direct audio files and podcast platform URLs
      if (!UrlPatterns.general.test(url)) {
        errors.push('Please provide a valid podcast URL')
      }
      break
    default:
      // For other types, basic URL validation is sufficient
      break
  }
  
  return errors
}

// ============================================================================
// Export all validation functions
// ============================================================================

export const Validators = {
  email: validateEmail,
  password: validatePassword,
  username: validateUsername,
  title: validateTitle,
  description: validateDescription,
  url: validateUrl,
  comment: validateComment,
  file: validateFile,
  resourceUrl: validateResourceUrl,
  loginForm: validateLoginForm,
  registerForm: validateRegisterForm,
  resourceSubmissionForm: validateResourceSubmissionForm,
  commentForm: validateCommentForm
} as const