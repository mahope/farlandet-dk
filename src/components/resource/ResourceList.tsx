import React from 'react'
import type { Resource } from '../../types'
import { ResourceCard } from './ResourceCard'
import { LoadingSpinner } from '../ui/loading-spinner'

interface ResourceListProps {
  resources: Resource[]
  loading?: boolean
  onVote?: (resourceId: string, voteType: 'up' | 'down') => void
  onViewDetails?: (resource: Resource) => void
  showVoting?: boolean
  emptyMessage?: string
  className?: string
}

export function ResourceList({
  resources,
  loading = false,
  onVote,
  onViewDetails,
  showVoting = true,
  emptyMessage = "Ingen ressourcer fundet",
  className = ""
}: ResourceListProps) {
  if (loading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <LoadingSpinner size="medium" />
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onVote={onVote}
          onViewDetails={onViewDetails}
          showVoting={showVoting}
        />
      ))}
    </div>
  )
}