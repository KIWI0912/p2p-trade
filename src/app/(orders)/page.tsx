// src/app/(orders)/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useListOrders, useGetMe, Order } from '@/lib/hooks'
import { zh } from '@/lib/i18n'
import { useNotification } from '@/components/ErrorHandler'
import Spinner from '@/components/ui/Spinner'
import { OrderCard } from '@/components/OrderCard'
import { Animate } from '@/components/ui/Animation'
import { useLanguage } from '@/lib/i18n'

// 莫兰迪色系
const colors = {
  primary: 'bg-[#A0A8B1] hover:bg-[#8C959E] text-white',
  secondary: 'bg-[#D8C3A5] hover:bg-[#C8B393] text-gray-800',
  success: 'bg-[#8E9D8A] hover:bg-[#7A8976] text-white',
  danger: 'bg-[#E98980] hover:bg-[#D97970] text-white',
  info: 'bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white',
  neutral: 'bg-[#E8DCD5] hover:bg-[#D8CCC5] text-gray-800',
};

export default function OrdersPage() {
  const { t } = useLanguage();
  const { data: me } = useGetMe();
  const { showError, NotificationDisplay } = useNotification();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // 使用hooks中的useListOrders而不是直接fetch
  const { data: orders = [], isLoading: loading, error, refetch } = useListOrders({
    status: filter === 'all' ? undefined : filter.toUpperCase(),
    limit: 50,
    offset: 0
  });

  // 添加调试信息
  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/orders/list');
        const data = await response.json();
        setDebugInfo({
          status: response.status,
          data: data,
          ordersCount: data.orders?.length || 0
        });
      } catch (err) {
        setDebugInfo({
          error: err.message
        });
      }
    };
    fetchDebugInfo();
  }, []);

  // 当过滤条件变化时刷新数据
  useEffect(() => {
    refetch();
  }, [filter, refetch]);

  // 处理错误
  useEffect(() => {
    if (error) {
      showError(error, t.errors.general);
    }
  }, [error, showError, t.errors.general]);

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Animate type="fade" duration={400}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{t.orders.allOrders}</h1>
            
            <div className="flex flex-wrap gap-3">
              {/* 过滤器 */}
              <div className="flex rounded-lg overflow-hidden border border-[#E8DCD5]">
                <button 
                  className={`px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-[#A0A8B1] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setFilter('all')}
                >
                  全部
                </button>
                <button 
                  className={`px-3 py-1.5 text-sm ${filter === 'pending' ? 'bg-[#A0A8B1] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setFilter('pending')}
                >
                  {t.orders.status.PENDING}
                </button>
                <button 
                  className={`px-3 py-1.5 text-sm ${filter === 'accepted' ? 'bg-[#A0A8B1] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setFilter('accepted')}
                >
                  {t.orders.status.ACCEPTED}
                </button>
                <button 
                  className={`px-3 py-1.5 text-sm ${filter === 'completed' ? 'bg-[#A0A8B1] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setFilter('completed')}
                >
                  {t.orders.status.COMPLETED}
                </button>
              </div>
              
              {/* 创建订单按钮 */}
              <Link
                href="/orders/new"
                className={`px-4 py-2 rounded-lg ${colors.primary} transition flex items-center gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.orders.create}
              </Link>
            </div>
          </div>
        </Animate>

        {/* 调试信息 */}
        {debugInfo && (
          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
            <h3 className="font-bold mb-2">调试信息:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <Spinner size={32} />
            <p className="mt-4 text-gray-500">{t.common.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600">错误: {error.message}</p>
            <button 
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              重试
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-500">暂无订单数据</p>
            <p className="mt-2 text-sm text-gray-400">数据库中可能还没有订单，请先创建一些订单</p>
            <Link
              href="/orders/new"
              className="mt-4 inline-block px-4 py-2 bg-[#A0A8B1] hover:bg-[#8C959E] text-white rounded-lg transition"
            >
              创建第一个订单
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 渲染订单列表 */}
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block">
                <OrderCard 
                  order={order} 
                  currentUserAddress={me?.address || ''} 
                />
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* 通知组件 */}
      <NotificationDisplay />
    </div>
  )
}