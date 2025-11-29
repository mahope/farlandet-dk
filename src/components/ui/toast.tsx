import React, { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { useToast, type ToastType } from '../../contexts/ToastContext'

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const styles: Record<ToastType, string> = {
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-destructive/10 border-destructive/30 text-destructive',
  warning: 'bg-warning/10 border-warning/30 text-warning-foreground',
  info: 'bg-primary/10 border-primary/30 text-primary',
}

const iconBgStyles: Record<ToastType, string> = {
  success: 'bg-success text-white',
  error: 'bg-destructive text-white',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-primary text-white',
}

interface ToastItemProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: () => void
}

function ToastItem({ id, type, title, message, duration = 5000, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration <= 0) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-2xl border-2 shadow-lg backdrop-blur-sm',
        'transform transition-all duration-300 ease-out',
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        'animate-slide-in-right',
        styles[type]
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 p-2 rounded-xl', iconBgStyles[type])}>
        {icons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <p className="font-semibold text-foreground">{title}</p>
        {message && (
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-foreground/10 transition-colors"
      >
        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden bg-foreground/5">
          <div
            className={cn(
              'h-full transition-all duration-100 ease-linear rounded-full',
              type === 'success' && 'bg-success',
              type === 'error' && 'bg-destructive',
              type === 'warning' && 'bg-warning',
              type === 'info' && 'bg-primary'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

export { ToastItem }
