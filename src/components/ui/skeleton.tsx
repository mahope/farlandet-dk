import React from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rounded'
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        {
          'rounded-md': variant === 'default',
          'rounded-full': variant === 'circular',
          'rounded-2xl': variant === 'rounded',
        },
        className
      )}
      {...props}
    />
  )
}

// Pre-built skeleton patterns for common use cases
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rounded" className="h-6 w-16" />
        <Skeleton variant="rounded" className="h-6 w-20" />
      </div>
    </div>
  )
}

export function SkeletonResourceCard() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton variant="rounded" className="h-5 w-14" />
          <Skeleton variant="rounded" className="h-5 w-18" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton variant="circular" className="w-8 h-8" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  return <Skeleton variant="circular" className={sizes[size]} />
}

export function SkeletonButton() {
  return <Skeleton variant="rounded" className="h-11 w-28" />
}

export function SkeletonBadge() {
  return <Skeleton variant="rounded" className="h-6 w-16" />
}
