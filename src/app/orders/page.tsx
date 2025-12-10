'use client'

import { useState, useEffect } from 'react'
import { useListOrders, useGetMe } from '@/lib/hooks'
import { OrderCard } from '@/components/OrderCard'
import { useLanguage } from '@/lib/i18n'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import { Animate, AnimateList } from '@/components/ui/Animation'
import { useNotification } from '@/components/ErrorHandler'

export default function OrdersPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { NotificationDisplay, showError } = useNotification()
  
  // 状态
  const [currentStatus, setCurrentStatus] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all' 或 'completed'
  
  // 每页显示数量
  const ITEMS_PER_PAGE = 10
  
  // API Hooks
  const { data: me } = useGetMe()
  const { 
    data: ordersData, 
    isLoading: loadingOrders,
    error: ordersError
  } = useListOrders({
    status: activeTab === 'completed' ? 'COMPLETED' : currentStatus,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    includePrivate: false // 明确指定不包含私密订单
  })
  
  // 处理错误
  useEffect(() => {
    if (ordersError) {
      showError(ordersError, t.errors?.general || '加载订单失败')
    }
  }, [ordersError, showError, t.errors])
  
  // 初始加载完成
  useEffect(() => {
    if (!loadingOrders && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [loadingOrders, isInitialLoad])
  
  // 状态选项
  const statusOptions = [
    { value: undefined, label: t.orders?.all || '全部' },
    { value: 'PENDING', label: t.orders?.status?.PENDING || '等待中' },
    { value: 'ACCEPTED', label: t.orders?.status?.ACCEPTED || '已接受' },
    { value: 'COMPLETED', label: t.orders?.status?.COMPLETED || '已完成' },
  ]
  
  // 处理状态筛选变化
  const handleStatusChange = (status: string | undefined) => {
    setCurrentStatus(status)
    setCurrentPage(1) // 重置到第一页
  }
  
  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // 计算总页数
  const totalPages = ordersData?.total 
    ? Math.ceil(ordersData.total / ITEMS_PER_PAGE) 
    : 1
  
  // 生成页码数组
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大可见页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 否则，显示当前页附近的页码
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      let endPage = startPage + maxVisiblePages - 1
      
      if (endPage > totalPages) {
        endPage = totalPages
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push('...')
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // 获取已完成订单
  const completedOrders = ordersData?.orders?.filter(order => 
    order.status === 'COMPLETED'
  ) || []

  // 根据当前标签过滤订单
  const displayedOrders = activeTab === 'completed' 
    ? completedOrders 
    : ordersData?.orders || []

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{activeTab === 'completed' ? '已完成订单' : '所有订单'}</h1>
            <p className="text-gray-600 text-lg">
              {activeTab === 'completed' 
                ? '浏览所有已成功完成的交易订单' 
                : '浏览所有可用的交易订单，找到您感兴趣的交易'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            {me && (
              <Link 
                href="/new" 
                className="px-5 py-3 bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white rounded-lg font-medium transition flex items-center justify-center text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                创建订单
              </Link>
            )}
            
            {!me && (
              <Link 
                href="/login" 
                className="px-5 py-3 bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white rounded-lg font-medium transition flex items-center justify-center text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                登录
              </Link>
            )}
          </div>
        </div>
        
        {/* 标签切换 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-6 font-medium text-base ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            所有订单
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-3 px-6 font-medium text-base ${
              activeTab === 'completed'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            已完成订单
          </button>
        </div>
        
        {/* 筛选器 - 仅在"所有订单"标签下显示 */}
        {activeTab === 'all' && (
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
        )}
        
        {/* 已完成订单标题 - 仅在"已完成订单"标签下显示 */}
        {activeTab === 'completed' && completedOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">交易成功案例</h2>
            <p className="text-gray-600 text-base">这些订单已成功完成交易，展示了平台的真实交易记录</p>
          </div>
        )}
        
        {/* 订单列表 */}
        {loadingOrders && isInitialLoad ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Spinner size={40} />
              <p className="mt-4 text-gray-600 text-lg">正在加载订单...</p>
            </div>
          </div>
        ) : displayedOrders.length > 0 ? (
          <div>
            <AnimateList type="fade" stagger={100} className="grid md:grid-cols-2 gap-6">
              {displayedOrders.map((order) => (
                <Link key={order.id} href={`/${order.id}`} className="block">
                  <OrderCard 
                    order={order} 
                    currentUserAddress={me?.address || ''}
                    featured={false}
                  />
                </Link>
              ))}
            </AnimateList>
            
            {/* 分页 - 仅在"所有订单"标签下显示 */}
            {activeTab === 'all' && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md mr-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 text-base"
                  >
                    &larr; 上一页
                  </button>
                  
                  <div className="flex space-x-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-4 py-2 text-base">...</span>
                      ) : (
                        <button
                          key={`page-${page}`}
                          onClick={() => handlePageChange(page as number)}
                          className={`px-4 py-2 rounded-md text-base ${
                            currentPage === page
                              ? 'bg-[#A2B5BB] text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md ml-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 text-base"
                  >
                    下一页 &rarr;
                  </button>
                </nav>
              </div>
            )}
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
                {activeTab === 'completed' ? '暂无已完成订单' : (currentStatus ? '没有找到符合条件的订单' : '暂无订单')}
              </h3>
              <p className="text-gray-500 mb-6 text-base">
                {activeTab === 'completed' 
                  ? '完成一笔交易后即可在此查看' 
                  : (currentStatus ? '请尝试其他筛选条件' : '创建第一个订单开始交易')}
              </p>
              
              {me ? (
                <Link 
                  href="/new" 
                  className="inline-flex items-center px-5 py-3 bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white rounded-lg transition text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  创建订单
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex items-center px-5 py-3 bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white rounded-lg transition text-base"
                >
                  登录
                </Link>
              )}
            </div>
          </Animate>
        )}
      </div>
      
      {/* 未登录提示 */}
      {!me && !loadingOrders && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-lg shadow-lg border border-[#E8DCD5] flex items-center gap-3 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#A2B5BB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700 text-base">登录后可进行更多操作</span>
          <Link 
            href="/login" 
            className="text-[#A2B5BB] hover:text-[#8FA3A9] font-medium text-base"
          >
            登录 &rarr;
          </Link>
        </div>
      )}
      
      {/* 通知组件 */}
      <NotificationDisplay />
    </div>
  )
}