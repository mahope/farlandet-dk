import React from 'react'
import type { Resource } from '../../types'
import { Button } from '../ui/button'
import { resourceTypeConfig } from '../../lib/validations/resource'

interface ResourceCardProps {
  resource: Resource
  onVote?: (resourceId: string, voteType: 'up' | 'down') => void
  onViewDetails?: (resource: Resource) => void
  showVoting?: boolean
}

export function ResourceCard({ resource, onVote, onViewDetails, showVoting = true }: ResourceCardProps) {
  const typeConfig = resourceTypeConfig[resource.resource_type] || resourceTypeConfig.link
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK')
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={() => onViewDetails?.(resource)}>
        {/* Resource Type Icon and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeConfig.icon}</span>
            <span className="text-sm font-medium text-muted-foreground capitalize">
              {typeConfig.label}
            </span>
          </div>
          {resource.status === 'pending' && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Afventer godkendelse
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {resource.title}
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
            {resource.description}
          </p>
        )}

        {/* Category */}
        {resource.category && (
          <div className="mb-3">
            <span 
              className="inline-block px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${resource.category.color}20`,
                color: resource.category.color 
              }}
            >
              {resource.category.name}
            </span>
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag.id}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
              >
                {tag.name}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{resource.tags.length - 3} flere
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* Vote Score */}
          {showVoting && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onVote?.(resource.id, 'up')
                }}
                className="p-1 rounded hover:bg-muted transition-colors"
                disabled={!onVote}
              >
                ▲
              </button>
              <span className="min-w-[1.5rem] text-center">
                {resource.vote_score}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onVote?.(resource.id, 'down')
                }}
                className="p-1 rounded hover:bg-muted transition-colors"
                disabled={!onVote}
              >
                ▼
              </button>
            </div>
          )}

          {/* View Count */}
          <span>{resource.view_count} visninger</span>

          {/* Date */}
          <span>{formatDate(resource.created_at)}</span>
        </div>

        {/* External Link Button */}
        {resource.url && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleExternalLink}
          >
            Åbn ressource
          </Button>
        )}
      </div>
    </div>
  )
}