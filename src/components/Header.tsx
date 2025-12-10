"use client"

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { AuthConnect } from './AuthConnect'  // 使用新的认证组件
import { WalletBalance } from './WalletBalance'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/i18n'
import { MobileNav, MobileNavButton } from './MobileNav'
import { Animate } from './ui/Animation'
import { SimpleLanguageToggle } from './LanguageSwitcher'

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 判断当前路径是否激活
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <>
      <header className="w-full bg-white border-b border-[#E8DCD5] sticky top-0 z-30">
        <Animate type="fade" duration={400}>
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#8E9D8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                这是一个交易
              </Link>
              <nav className="hidden md:flex gap-3 text-sm">
                <Link 
                  href="/orders" 
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive('/orders') && !isActive('/orders/my-orders') && !isActive('/new')
                      ? 'text-[#8E9D8A] font-medium bg-[#F0F4F0]' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t.orders.allOrders}
                </Link>
                <Link 
                  href="/orders/my-orders" 
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive('/orders/my-orders') 
                      ? 'text-[#8E9D8A] font-medium bg-[#F0F4F0]' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t.orders.myOrders}
                </Link>
                <Link 
                  href="/new" 
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive('/new') 
                      ? 'text-[#A2B5BB] font-medium bg-[#EFF2F5]' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t.orders.create}
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {mounted && (
                <>
                  {/* 语言切换 */}
                  <SimpleLanguageToggle />
                  
                  <div className="hidden sm:block">
                    <WalletBalance />
                  </div>
                  <AuthConnect />  {/* 使用新的认证组件 */}
                </>
              )}
              
              {/* 移动端菜单按钮 */}
              <MobileNavButton onClick={() => setMobileNavOpen(true)} />
            </div>
          </div>
        </Animate>
      </header>
      
      {/* 移动端导航菜单 */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  )
}