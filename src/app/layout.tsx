import React from 'react'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'
import '@/styles/globals.css'

export const metadata = {
  title: '这是一个交易平台',
  description: '点对点去中心化交易平台，个人对个人安全交易',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#F8F5F2]">
        <Providers>
          <Header />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}