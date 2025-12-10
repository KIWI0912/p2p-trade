'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGetMyOrders, useGetMe } from '@/lib/hooks'
import { OrderCard } from '@/components/OrderCard'
import { useLanguage } from '@/lib/i18n'
import { Animate, AnimateList } from '@/components/ui/Animation'
import Spinner from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { VirtualList } from '@/components/ui/VirtualList'

export default function MyOrdersPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [tab, setTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'COMPLETED'>('ALL')
  const { data: orders, isLoading } = useGetMyOrders()
  const { data: me } = useGetMe()

  // 根据当前选项卡筛选订单
  const filteredOrders = orders?.filter(order => 
    tab === 'ALL' ? true : order.status === tab
  ) || []

  // 渲染空状态
  const renderEmptyState = () => (
    <Animate type="fade">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-6 bg-gray-100 rounded-full p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">{t.orders.noOrdersYet || '暂无订单'}</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          {t.orders.emptyStateMessage || '您还没有创建任何订单。开始创建您的第一个订单，探索物品交易的可能性。'}
        </p>
        <Button variant="primary" asChild>
          <Link href="/order/new">{t.orders.create}</Link>
        </Button>
      </div>
    </Animate>
  )

  // 处理点击订单
  const handleOrderClick = (orderId: number) => {
    router.push(`/order/${orderId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {t.orders.myOrders}
        </h1>
        
        <Button variant="primary" asChild>
          <Link href="/order/new">{t.orders.create}</Link>
        </Button>
      </div>

      {/* 选项卡 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6">
          {(['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setTab(status)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${tab === status
                  ? 'border-[#8E9D8A] text-[#5A7052]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {status === 'ALL'
                ? t.orders.all || '全部'
                : t.orders.status[status] || status
              }
            </button>
          ))}
        </nav>
      </div>

      {/* 加载状态 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={32} />
        </div>
      ) : filteredOrders.length === 0 ? (
        // 空状态
        renderEmptyState()
      ) : (
        // 订单列表
        <AnimateList stagger={100} className="space-y-4">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => handleOrderClick(order.id)}
              className="cursor-pointer"
            >
              <OrderCard 
                order={order} 
                currentUserAddress={me?.address || ""}
              />
            </div>
          ))}
        </AnimateList>
      )}
    </div>
  )
}