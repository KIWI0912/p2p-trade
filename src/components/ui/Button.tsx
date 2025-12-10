// src/components/ui/Button.tsx
import React from 'react'
import { zh } from '@/lib/i18n'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'info' | 'neutral' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  asChild?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  asChild = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // 莫兰迪色系
  const variantStyles = {
    primary: 'bg-[#A0A8B1] hover:bg-[#8C959E] text-white focus:ring-[#A0A8B1] disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-[#D8C3A5] hover:bg-[#C8B393] text-gray-800 focus:ring-[#D8C3A5] disabled:bg-gray-300 disabled:text-gray-500',
    success: 'bg-[#8E9D8A] hover:bg-[#7A8976] text-white focus:ring-[#8E9D8A] disabled:bg-gray-300 disabled:text-gray-500',
    danger: 'bg-[#E98980] hover:bg-[#D97970] text-white focus:ring-[#E98980] disabled:bg-gray-300 disabled:text-gray-500',
    info: 'bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white focus:ring-[#A2B5BB] disabled:bg-gray-300 disabled:text-gray-500',
    neutral: 'bg-[#E8DCD5] hover:bg-[#D8CCC5] text-gray-800 focus:ring-[#E8DCD5] disabled:bg-gray-300 disabled:text-gray-500',
    outline: 'bg-transparent border-2 border-[#A0A8B1] text-[#A0A8B1] hover:bg-[#F8F5F2] focus:ring-[#A0A8B1] disabled:border-gray-300 disabled:text-gray-400',
  }

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

  // 如果 asChild 为 true，则将样式应用到子元素
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      className: combinedClassName,
      ...props
    })
  }

  return (
    <button
      disabled={disabled || loading}
      className={combinedClassName}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {zh.common.loading}
        </span>
      ) : (
        children
      )}
    </button>
  )
}