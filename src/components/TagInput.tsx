import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Tag as TagIcon, Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import { api, Tag } from '@/lib/api'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
  error?: string
  className?: string
}

export function TagInput({
  value = [],
  onChange,
  maxTags = 10,
  placeholder = 'Søg efter tags...',
  error,
  className
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [popularTags, setPopularTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Fetch popular tags on mount
  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        const response = await api.searchTags({ limit: 8 })
        if (response.success && response.data) {
          setPopularTags(response.data)
        }
      } catch (err) {
        console.error('Failed to fetch popular tags:', err)
      }
    }
    fetchPopularTags()
  }, [])

  // Debounced search
  const searchTags = useCallback(async (query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 1) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await api.searchTags({ q: query, limit: 8 })
        if (response.success && response.data) {
          // Filter out already selected tags
          const filteredSuggestions = response.data.filter(
            tag => !value.includes(tag.name)
          )
          setSuggestions(filteredSuggestions)
        }
      } catch (err) {
        console.error('Failed to search tags:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }, [value])

  useEffect(() => {
    searchTags(inputValue)
  }, [inputValue, searchTags])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addTag = (tagName: string) => {
    const normalizedTag = tagName.trim().toLowerCase()
    if (!normalizedTag) return
    if (value.length >= maxTags) return
    if (value.includes(normalizedTag)) return

    onChange([...value, normalizedTag])
    setInputValue('')
    setSuggestions([])
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        addTag(suggestions[highlightedIndex].name)
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setHighlightedIndex(-1)
    } else if (e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    }
  }

  const availablePopularTags = popularTags.filter(
    tag => !value.includes(tag.name)
  )

  const canAddMore = value.length < maxTags

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              <TagIcon className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                aria-label={`Fjern tag: ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input with dropdown */}
      {canAddMore && (
        <div className="relative">
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value)
                setShowDropdown(true)
                setHighlightedIndex(-1)
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'pr-10',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Dropdown suggestions */}
          {showDropdown && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto"
              role="listbox"
            >
              {suggestions.map((tag, index) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.name)}
                  className={cn(
                    'w-full px-3 py-2 text-left flex items-center justify-between hover:bg-accent transition-colors',
                    index === highlightedIndex && 'bg-accent'
                  )}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  <span className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{tag.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tag.resource_count} ressourcer
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular tags */}
      {availablePopularTags.length > 0 && canAddMore && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Populære tags:</p>
          <div className="flex flex-wrap gap-2">
            {availablePopularTags.slice(0, 6).map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag.name)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full text-xs transition-colors"
              >
                <TagIcon className="h-3 w-3" />
                {tag.name}
                <span className="text-muted-foreground/60">
                  ({tag.resource_count})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <div className="flex items-center justify-between text-xs">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          <span className="text-muted-foreground">
            Tryk Enter eller komma for at tilføje
          </span>
        )}
        <span className={cn(
          'text-muted-foreground',
          value.length >= maxTags && 'text-amber-600'
        )}>
          {value.length}/{maxTags} tags
        </span>
      </div>
    </div>
  )
}
