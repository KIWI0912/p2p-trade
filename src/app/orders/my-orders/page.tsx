'use client'

import { useState, useEffect } from 'react'
import { useMyOrders, useGetMe } from '@/lib/hooks'
import { OrderCard } from '@/components/OrderCard'
import { useLanguage } from '@/lib/i18n'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import { Animate, AnimateList } from '@/components/ui/Animation'
import { useNotification } from '@/components/ErrorHandler'
import { AuthRequired } from '@/components/AuthRequired'

export default function MyOrdersPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { NotificationDisplay, showError } = useNotification()
  
  // 状态
  const [currentStatus, setCurrentStatus] = useState<string | undefined>(undefined)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // API Hooks
  const { data: me } = useGetMe()
  const { 
    data: ordersData, 
    isLoading: loadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useMyOrders()
  
  // 处理错误
  useEffect(() => {
    if (ordersError) {
      setError('加载订单失败，请稍后重试')
      showError(ordersError, t.errors?.general || '加载订单失败')
    }
  }, [ordersError, showError, t.errors])
  
  // 初始加载完成
  useEffect(() => {
    if (!loadingOrders && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [loadingOrders, isInitialLoad])

  // 定期刷新订单数据
  useEffect(() => {
    const interval = setInterval(() => {
      if (me) {
        refetchOrders()
      }
    }, 30000) // 每30秒刷新一次
    
    return () => clearInterval(interval)
  }, [me, refetchOrders])
  
  // 状态选项
  const statusOptions = [
    { value: undefined, label: '全部订单' },
    { value: 'PENDING', label: '等待中' },
    { value: 'ACCEPTED', label: '已接受' },
    { value: 'COMPLETED', label: '已完成' },
  ]
  
  // 处理状态筛选变化
  const handleStatusChange = (status: string | undefined) => {
    setCurrentStatus(status)
  }

  // 根据状态筛选订单
  const filteredOrders = ordersData?.orders?.filter(order => 
    currentStatus ? order.status === currentStatus : true
  ) || []

  // 使用 AuthRequired 组件包装整个页面内容
  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">我的订单</h1>
            <p className="text-gray-600 text-lg">
              管理您创建和参与的所有交易订单
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Link 
              href="/new" 
              className="px-5 py-3 bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white rounded-lg font-medium transition flex items-center justify-center text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              创建订单
            </Link>
            
            <Link 
              href="/orders" 
              className="px-5 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition flex items-center justify-center text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              浏览所有订单
            </Link>
          </div>
        </div>
        
        {/* 使用 AuthRequired 组件包装需要认证的内容 */}
        <AuthRequired message="请连接钱包并完成认证以查看您的订单">
          {/* 筛选器 */}
          <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="mr-4">
                <label className="block text-base font-medium text-gray-700 mb-2">订单状态</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value || 'all'}
                      onClick={() => handleStatusChange(option.value)}
                      className={`px-4 py-2 text-base rounded-full transition ${
                        currentStatus === option.value
                          ? 'bg-[#A2B5BB] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
              <div className="mt-2 flex justify-end">
                <button 
                  onClick={() => {
                    setError(null)
                    refetchOrders()
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  重试
                </button>
              </div>
            </div>
          )}
          
          {/* 订单列表 */}
          {loadingOrders && isInitialLoad ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Spinner size={40} />
                <p className="mt-4 text-gray-600 text-lg">正在加载您的订单...</p>
              </div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div>
              <AnimateList type="fade" stagger={100} className="grid md:grid-cols-2 gap-6">
                {filteredOrders.map((order) => (
                  <Link key={order.id} href={`/${order.id}`} className="block">
                    <OrderCard 
                      order={order} 
                      currentUserAddress={me?.address || ''}
                      hideWalletAddress={true}
                    />
                  </Link>
                ))}
              </AnimateList>
            </div>
          ) : (
            <Animate type="fade">
              <div className="bg-white rounded-lg shadow-sm p-10 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {currentStatus ? '没有找到符合条件的订单' : '您还没有创建或参与任何订单'}
                </h3>
                <p className="text-gray-500 mb-6 text-base">
                  {currentStatus ? '请尝试其他筛选条件' : '创建您的第一个订单，开始交易之旅'}
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link 
                    href="/new" 
                    className="inline-flex items-center px-5 py-3 bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white rounded-lg transition text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    创建订单
                  </Link>
                  
                  <button
                    onClick={() => refetchOrders()}
                    className="inline-flex items-center px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    刷新订单
                  </button>
                </div>
              </div>
            </Animate>
          )}
        </AuthRequired>
      </div>
      
      {/* 通知组件 */}
      <NotificationDisplay />
    </div>
  )
}