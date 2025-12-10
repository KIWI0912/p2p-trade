// src/app/(auth)/logout/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/lib/hooks'

export default function LogoutPage() {
  const router = useRouter()
  // 修复: 正确解构 useMutation 返回的对象
  const { mutateAsync: logout, isPending: loading, error } = useLogout()
  const [hasLogged, setHasLogged] = useState(false)

  useEffect(() => {
    if (!hasLogged) {
      handleLogout()
    }
  }, [hasLogged])

  const handleLogout = async () => {
    try {
      setHasLogged(true)
      await logout()
      // 重定向到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">正在登出</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {String(error)}
          </div>
        )}

        {!error && (
          <div>
            <p className="text-gray-600 mb-4">您已成功登出。</p>
            <p className="text-sm text-gray-500">正在重定向到登录页面...</p>
          </div>
        )}
      </div>
    </div>
  )
}