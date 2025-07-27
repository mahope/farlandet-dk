// ============================================================================
// Core Data Model Interfaces
// ============================================================================

export type ResourceType = 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series';
export type ResourceStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'moderator' | 'admin';
export type VoteType = 'up' | 'down';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
  // Computed field for UI
  resourceCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string | null;
  resource_type: ResourceType;
  category_id: string | null;
  submitter_email: string | null;
  submitter_id: string | null;
  status: ResourceStatus;
  vote_score: number;
  view_count: number;
  rejection_reason: string | null;
  metadata: import('./database').Json | null;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
  tags?: Tag[];
  submitter?: UserProfile;
  comments?: Comment[];
  user_vote?: Vote;
}

export interface Vote {
  id: string;
  user_id: string;
  resource_id: string;
  vote_type: VoteType;
  created_at: string;
  updated_at: string;
  // Relations
  user?: UserProfile;
  resource?: Resource;
}

export interface Comment {
  id: string;
  resource_id: string;
  user_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  user?: UserProfile;
  resource?: Resource;
}

export interface ResourceTag {
  resource_id: string;
  tag_id: string;
  created_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ResourcesResponse {
  resources: Resource[];
  categories: Category[];
  tags: Tag[];
  totalCount: number;
}

export interface SearchResponse {
  resources: Resource[];
  totalCount: number;
  searchTerm: string;
  filters: SearchFilters;
}

// ============================================================================
// Form Types and Validation Schemas
// ============================================================================

export interface ResourceSubmissionForm {
  title: string;
  description: string;
  resourceType: ResourceType;
  categoryId: string;
  tags: string[];
  url?: string;
  file?: File;
  submitterEmail?: string;
  // Resource type specific fields
  bookDetails?: BookDetails;
  videoDetails?: VideoDetails;
  movieDetails?: MovieDetails;
  articleDetails?: ArticleDetails;
  podcastDetails?: PodcastDetails;
}

export interface BookDetails {
  author?: string;
  isbn?: string;
  publishYear?: number;
  publisher?: string;
  purchaseLinks?: string[];
}

export interface VideoDetails {
  duration?: number;
  channel?: string;
  platform?: 'youtube' | 'vimeo' | 'other';
  embedId?: string;
}

export interface MovieDetails {
  director?: string;
  releaseYear?: number;
  genre?: string[];
  imdbId?: string;
  streamingPlatforms?: string[];
  rating?: string;
}

export interface ArticleDetails {
  author?: string;
  publication?: string;
  publishDate?: string;
  readingTime?: number;
}

export interface PodcastDetails {
  host?: string;
  episodeNumber?: number;
  duration?: number;
  platform?: string;
}

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

export interface SearchFilters {
  query?: string;
  categoryIds?: string[];
  tagIds?: string[];
  resourceTypes?: ResourceType[];
  status?: ResourceStatus[];
  sortBy?: 'created_at' | 'vote_score' | 'view_count' | 'title';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// Component Props and State Management Types
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ResourceItemProps extends BaseComponentProps {
  resource: Resource;
  showVoting?: boolean;
  showComments?: boolean;
  onVote?: (resourceId: string, voteType: VoteType) => void;
  onComment?: (resourceId: string, content: string) => void;
}

export interface CategoryCardProps extends BaseComponentProps {
  category: Category;
  resources: Resource[];
  maxResources?: number;
}

export interface MasonryGridProps extends BaseComponentProps {
  categories: Category[];
  resources: Resource[];
  loading?: boolean;
}

export interface SearchBarProps extends BaseComponentProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export interface FilterPanelProps extends BaseComponentProps {
  filters: SearchFilters;
  categories: Category[];
  tags: Tag[];
  onFiltersChange: (filters: SearchFilters) => void;
}

export interface VotingButtonsProps extends BaseComponentProps {
  resourceId: string;
  voteScore: number;
  userVote?: VoteType;
  onVote: (voteType: VoteType) => void;
  disabled?: boolean;
}

export interface CommentSectionProps extends BaseComponentProps {
  resourceId: string;
  comments: Comment[];
  onAddComment: (content: string) => void;
  loading?: boolean;
}

export interface UploadFormProps extends BaseComponentProps {
  onSubmit: (data: ResourceSubmissionForm) => void;
  categories: Category[];
  tags: Tag[];
  loading?: boolean;
}

export interface ModerationPanelProps extends BaseComponentProps {
  pendingResources: Resource[];
  onApprove: (resourceId: string) => void;
  onReject: (resourceId: string, reason: string) => void;
  loading?: boolean;
}

// ============================================================================
// State Management Types
// ============================================================================

export interface AuthState {
  user: UserProfile | null;
  session: Record<string, unknown> | null; // Supabase session type
  loading: boolean;
  error: string | null;
}

export interface ResourcesState {
  resources: Resource[];
  categories: Category[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
}

export interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

// ============================================================================
// Utility Types
// ============================================================================

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Database insert/update types
export type ResourceInsert = Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'vote_score' | 'view_count' | 'category' | 'tags' | 'submitter' | 'comments' | 'user_vote'>;
export type ResourceUpdate = Partial<ResourceInsert>;

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at' | 'resourceCount'>;
export type CategoryUpdate = Partial<CategoryInsert>;

export type TagInsert = Omit<Tag, 'id' | 'created_at'>;
export type TagUpdate = Partial<TagInsert>;

export type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'user' | 'resource'>;
export type CommentUpdate = Partial<Pick<Comment, 'content' | 'is_deleted'>>;

export type VoteInsert = Omit<Vote, 'id' | 'created_at' | 'updated_at' | 'user' | 'resource'>;
export type VoteUpdate = Partial<Pick<Vote, 'vote_type'>>;

// Form validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

// Event handler types
export type EventHandler<T = void> = (event: React.SyntheticEvent) => T;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T> = (data: T) => void | Promise<void>;

// Generic loading and error states
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Search and filter utility types
export type SortDirection = 'asc' | 'desc';
export type SortField = keyof Resource | 'relevance';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

// File upload types
export interface FileUploadState {
  file: File | null;
  progress: number;
  uploading: boolean;
  error: string | null;
  url: string | null;
}

export interface FileUploadOptions {
  maxSize: number;
  allowedTypes: string[];
  bucket: string;
  path?: string;
}

// ============================================================================
// Re-export Database, Validation, and Guard Types
// ============================================================================

export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database'