// src/components/ui/Card.tsx
import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseStyles = 'rounded-lg p-6 transition-all'
  const variantStyles = {
    default: 'bg-white shadow-md',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children?: React.ReactNode
}

export function CardHeader({ title, subtitle, action, children }: CardHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        {title && <h2 className="text-lg font-semibold text-gray-800">{title}</h2>}
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`text-gray-700 ${className}`}>{children}</div>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`pt-4 border-t border-gray-200 mt-4 ${className}`}>
      {children}
    </div>
  )
}
