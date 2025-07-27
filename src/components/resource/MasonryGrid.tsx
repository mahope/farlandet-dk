import React from 'react'
import type { Category, Resource } from '../../types'
import { ResourceList } from './ResourceList'
import { Button } from '../ui/button'
import { LoadingSpinner } from '../ui/loading-spinner'

interface MasonryGridProps {
  categories: Category[]
  resourcesByCategory: Record<string, Resource[]>
  loading?: boolean
  onVote?: (resourceId: string, voteType: 'up' | 'down') => void
  onViewDetails?: (resource: Resource) => void
  onViewCategory?: (category: Category) => void
  maxResourcesPerCategory?: number
}

export function MasonryGrid({
  categories,
  resourcesByCategory,
  loading = false,
  onVote,
  onViewDetails,
  onViewCategory,
  maxResourcesPerCategory = 5
}: MasonryGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="large" text="Indlæser ressourcer..." />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Ingen kategorier fundet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
      {categories.map((category) => {
        const categoryResources = resourcesByCategory[category.id] || []
        const displayResources = categoryResources.slice(0, maxResourcesPerCategory)
        const hasMoreResources = categoryResources.length > maxResourcesPerCategory

        return (
          <div 
            key={category.id} 
            className="bg-card border rounded-lg overflow-hidden break-inside-avoid"
          >
            {/* Category Header */}
            <div 
              className="p-4 border-b cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: `${category.color}15` }}
              onClick={() => onViewCategory?.(category)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: category.color }}>
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {categoryResources.length} ressourcer
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="p-4">
              {displayResources.length > 0 ? (
                <div className="space-y-3">
                  {displayResources.map((resource) => (
                    <div 
                      key={resource.id}
                      className="p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer bg-background"
                      onClick={() => onViewDetails?.(resource)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm line-clamp-2 flex-1">
                          {resource.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <span>▲</span>
                          <span>{resource.vote_score}</span>
                        </div>
                      </div>
                      
                      {resource.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {resource.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{resource.resource_type}</span>
                        <span>{resource.view_count} visninger</span>
                      </div>
                    </div>
                  ))}

                  {/* View More Button */}
                  {hasMoreResources && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => onViewCategory?.(category)}
                    >
                      Se alle {categoryResources.length} ressourcer
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Ingen ressourcer i denne kategori endnu
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}