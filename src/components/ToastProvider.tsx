"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Toast = { id: string; message: string; type?: 'info' | 'success' | 'error' }

type ToastContextValue = {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2, 9)
    setList((s) => [...s, { id, message, type }])
    setTimeout(() => {
      setList((s) => s.filter((t) => t.id !== id))
    }, 6000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted && (
        <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-3">
          {list.map((t) => (
            <div
              key={t.id}
              className={`max-w-sm w-full px-4 py-3 rounded shadow-lg text-sm text-white ${
                t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
