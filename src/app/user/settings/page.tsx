'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGetMe } from '@/lib/hooks'
import Spinner from '@/components/ui/Spinner'
import { useNotification } from '@/components/ErrorHandler'

export default function UserSettingsPage() {
  const router = useRouter()
  const { data: me, isLoading, refetch } = useGetMe()
  const { showSuccess, showError, NotificationDisplay } = useNotification()
  
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 当用户数据加载完成后，设置初始用户名
  useEffect(() => {
    if (me?.name) {
      setUsername(me.name)
    }
  }, [me])
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      showError(new Error('用户名不能为空'), '验证失败')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 调用API更新用户名
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '更新用户名失败')
      }
      
      // 刷新用户数据
      await refetch()
      
      showSuccess('用户名更新成功')
      
      // 重定向到首页或之前的页面
      router.push('/')
    } catch (error: any) {
      showError(error, '更新失败')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 如果正在加载用户数据，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <Spinner size={40} />
          <p className="mt-4 text-gray-600 text-lg">加载中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#F8F5F2] py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">用户设置</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的用户名"
                maxLength={20}
              />
              <p className="mt-2 text-sm text-gray-500">
                用户名将显示在您创建的订单中，其他用户可以看到
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                返回
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#A2B5BB] hover:bg-[#8FA3A9] disabled:bg-gray-300 text-white rounded-lg transition flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size={16} className="mr-2" /> 保存中...
                  </>
                ) : (
                  '保存设置'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">钱包信息</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 break-all">
                <span className="font-medium">钱包地址: </span>
                {me?.address || '未连接钱包'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 通知组件 */}
      <NotificationDisplay />
    </div>
  )
}