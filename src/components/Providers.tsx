"use client"

import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/web3' // 使用集中配置的 wagmi 配置
import { ToastProvider } from './ToastProvider'
import ErrorBoundary from './ErrorBoundary'
import { LanguageProvider } from '@/lib/i18n'
import { initializeWallet } from '@/lib/walletInit'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  // 在组件挂载时检查是否已经初始化
  useEffect(() => {
    // 调用初始化函数
    initializeWallet()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <LanguageProvider>
          <ToastProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </LanguageProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}