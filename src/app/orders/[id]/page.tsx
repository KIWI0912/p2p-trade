'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 这个页面只是一个重定向页面
export default function OrderRedirectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  useEffect(() => {
    // 路由组(orders)在实际URL中不应该包含括号
    // 正确的URL应该是/id
    router.replace(`/${params.id}`)
  }, [router, params.id])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在重定向...</p>
      </div>
    </div>
  )
}