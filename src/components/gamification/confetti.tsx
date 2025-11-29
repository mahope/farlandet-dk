import React, { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  rotation: number
  size: number
}

interface ConfettiProps {
  active: boolean
  duration?: number
  pieces?: number
  colors?: string[]
  className?: string
}

const defaultColors = [
  'hsl(270 75% 58%)', // Primary purple
  'hsl(175 55% 48%)', // Secondary teal
  'hsl(12 76% 61%)',  // Accent coral
  'hsl(158 64% 52%)', // Success green
  'hsl(45 93% 58%)',  // Warning yellow
]

export function Confetti({
  active,
  duration = 3000,
  pieces = 50,
  colors = defaultColors,
  className,
}: ConfettiProps) {
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (active) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: pieces }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 500,
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 8,
      }))

      setConfettiPieces(newPieces)
      setIsVisible(true)

      // Clean up after duration
      const timeout = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setConfettiPieces([]), 500)
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [active, pieces, colors, duration])

  if (!isVisible && confettiPieces.length === 0) return null

  return (
    <div
      className={cn(
        'fixed inset-0 pointer-events-none overflow-hidden z-50',
        !isVisible && 'opacity-0 transition-opacity duration-500',
        className
      )}
    >
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${2000 + Math.random() * 1000}ms`,
          }}
        >
          <div
            className="rounded-sm"
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Burst confetti from a specific point
interface ConfettiBurstProps {
  active: boolean
  x?: number
  y?: number
  pieces?: number
  colors?: string[]
  spread?: number
}

export function ConfettiBurst({
  active,
  x = 50,
  y = 50,
  pieces = 30,
  colors = defaultColors,
  spread = 150,
}: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    angle: number
    distance: number
    color: string
    size: number
  }>>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: pieces }, (_, i) => ({
        id: i,
        angle: (i / pieces) * 360 + Math.random() * 30,
        distance: spread * (0.5 + Math.random() * 0.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
      }))

      setParticles(newParticles)
      setIsVisible(true)

      const timeout = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => setParticles([]), 500)
      }, 1500)

      return () => clearTimeout(timeout)
    }
  }, [active, pieces, colors, spread])

  if (!isVisible && particles.length === 0) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      style={{ perspective: '500px' }}
    >
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180
        const endX = Math.cos(radians) * particle.distance
        const endY = Math.sin(radians) * particle.distance

        return (
          <div
            key={particle.id}
            className={cn(
              'absolute rounded-full',
              isVisible ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              animation: `burst 1s ease-out forwards`,
              ['--end-x' as string]: `${endX}px`,
              ['--end-y' as string]: `${endY}px`,
            }}
          />
        )
      })}
      <style>{`
        @keyframes burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Hook to trigger confetti
export function useConfetti() {
  const [isActive, setIsActive] = useState(false)

  const trigger = () => {
    setIsActive(true)
    setTimeout(() => setIsActive(false), 100)
  }

  return { isActive, trigger }
}
