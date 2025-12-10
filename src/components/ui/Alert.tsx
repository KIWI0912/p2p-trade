// src/components/ui/Alert.tsx
import React from 'react'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  children?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}

export function Alert({
  variant = 'info',
  title,
  message,
  children,
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }

  const iconVariants = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕',
  }

  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]} flex gap-3`}>
      <div className="flex-shrink-0">{iconVariants[variant]}</div>
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        {message && <p className="text-sm">{message}</p>}
        {children && <div className="text-sm mt-2">{children}</div>}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-lg font-bold hover:opacity-70 transition"
        >
          ×
        </button>
      )}
    </div>
  )
}
