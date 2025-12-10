import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  // 莫兰迪色系
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-[#A0A8B1] text-white',
    secondary: 'bg-[#D8C3A5] text-gray-800',
    success: 'bg-[#8E9D8A] text-white',
    danger: 'bg-[#E98980] text-white',
    warning: 'bg-[#E8DCD5] text-gray-800',
    info: 'bg-[#A2B5BB] text-white',
  };

  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium';
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}