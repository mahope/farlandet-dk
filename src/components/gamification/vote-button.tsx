import React, { useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface VoteButtonProps {
  initialVotes?: number
  initialVoted?: boolean
  onVote?: (voted: boolean) => void | Promise<void>
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export function VoteButton({
  initialVotes = 0,
  initialVoted = false,
  onVote,
  disabled = false,
  size = 'md',
  showCount = true,
  className,
}: VoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted)
  const [votes, setVotes] = useState(initialVotes)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showFloatingNumber, setShowFloatingNumber] = useState(false)

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = useCallback(async () => {
    if (disabled) return

    const newVoted = !voted

    // Optimistic update
    setVoted(newVoted)
    setVotes((prev) => prev + (newVoted ? 1 : -1))

    // Trigger animations
    if (newVoted) {
      setIsAnimating(true)
      setShowFloatingNumber(true)
      setTimeout(() => setIsAnimating(false), 600)
      setTimeout(() => setShowFloatingNumber(false), 1000)
    }

    // Call callback
    try {
      await onVote?.(newVoted)
    } catch {
      // Revert on error
      setVoted(!newVoted)
      setVotes((prev) => prev + (newVoted ? -1 : 1))
    }
  }, [voted, disabled, onVote])

  return (
    <div className={cn('relative inline-flex items-center gap-2', className)}>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          sizes[size],
          voted
            ? 'bg-accent/15 text-accent hover:bg-accent/25'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-accent',
          isAnimating && 'animate-heart-beat',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Heart icon */}
        <svg
          className={cn(
            iconSizes[size],
            'transition-transform duration-300',
            voted && 'scale-110'
          )}
          fill={voted ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={voted ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>

        {/* Burst particles */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-confetti-fall"
                style={{
                  transform: `rotate(${i * 60}deg) translateY(-12px)`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        )}
      </button>

      {/* Vote count */}
      {showCount && (
        <span
          className={cn(
            'font-semibold tabular-nums transition-all duration-300',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg',
            voted ? 'text-accent' : 'text-muted-foreground'
          )}
        >
          {votes}
        </span>
      )}

      {/* Floating +1 animation */}
      {showFloatingNumber && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-accent font-bold text-sm animate-number-pop pointer-events-none">
          +1
        </span>
      )}
    </div>
  )
}

// Compact inline version
export function VoteButtonInline({
  initialVotes = 0,
  initialVoted = false,
  onVote,
  disabled = false,
  className,
}: Omit<VoteButtonProps, 'size' | 'showCount'>) {
  const [voted, setVoted] = useState(initialVoted)
  const [votes, setVotes] = useState(initialVotes)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = useCallback(async () => {
    if (disabled) return

    const newVoted = !voted
    setVoted(newVoted)
    setVotes((prev) => prev + (newVoted ? 1 : -1))

    if (newVoted) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 400)
    }

    try {
      await onVote?.(newVoted)
    } catch {
      setVoted(!newVoted)
      setVotes((prev) => prev + (newVoted ? -1 : 1))
    }
  }, [voted, disabled, onVote])

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'text-sm font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        voted
          ? 'bg-accent/15 text-accent hover:bg-accent/25'
          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-accent',
        isAnimating && 'scale-110',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <svg
        className={cn('w-4 h-4', isAnimating && 'animate-pop')}
        fill={voted ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={voted ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="tabular-nums">{votes}</span>
    </button>
  )
}
