import React from 'react'
import { ResourceSubmissionForm } from './ResourceSubmissionForm'

interface ResourceSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ResourceSubmissionModal({ isOpen, onClose }: ResourceSubmissionModalProps) {
  if (!isOpen) return null

  const handleSuccess = () => {
    onClose()
    // Could add a success toast notification here
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Tilføj ny ressource</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Luk"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ResourceSubmissionForm
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}