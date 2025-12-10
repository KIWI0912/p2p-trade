"use client";

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import type { Order } from '@/lib/hooks';
import { Badge } from '@/components/ui/Badge';
import { translateItemName } from '@/lib/itemTranslations';
import { useMemo, useEffect, useState } from 'react';

// 莫兰迪色系
const colors = {
  pending: 'bg-[#E8DCD5] text-gray-800',
  accepted: 'bg-[#A2B5BB] text-white',
  completed: 'bg-[#8E9D8A] text-white',
  cancelled: 'bg-[#E98980] text-white',
  disputed: 'bg-[#D8C3A5] text-gray-800',
  timelimited: 'bg-[#FFB347] text-gray-800',
};

interface OrderCardProps {
  order: Order;
  currentUserAddress?: string;
  featured?: boolean;
  hideWalletAddress?: boolean;
}

export function OrderCard({ order, currentUserAddress = "", featured = false, hideWalletAddress = false }: OrderCardProps) {
  // 使用语言钩子替代直接导入
  const { t } = useLanguage();
  
  // 倒计时状态
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  
  // 计算倒计时
  useEffect(() => {
    if (!order.expiryDate) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(order.expiryDate as string);
      
      if (now > expiry) {
        setTimeRemaining('已过期');
        return;
      }
      
      const diffMs = expiry.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffDays > 0) {
        setTimeRemaining(`${diffDays}天${diffHours}小时`);
      } else if (diffHours > 0) {
        setTimeRemaining(`${diffHours}小时${diffMinutes}分钟`);
      } else {
        setTimeRemaining(`${diffMinutes}分钟`);
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // 每分钟更新一次
    
    return () => clearInterval(interval);
  }, [order.expiryDate]);
  
  // 获取订单状态对应的文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return t.orders?.status?.PENDING || '等待中';
      case 'ACCEPTED': return t.orders?.status?.ACCEPTED || '已接受';
      case 'COMPLETED': return t.orders?.status?.COMPLETED || '已完成';
      case 'CANCELLED': return t.orders?.status?.CANCELLED || '已取消';
      case 'DISPUTED': return t.orders?.status?.DISPUTED || '有争议';
      default: return status;
    }
  };

  // 获取订单状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return colors.pending;
      case 'ACCEPTED': return colors.accepted;
      case 'COMPLETED': return colors.completed;
      case 'CANCELLED': return colors.cancelled;
      case 'DISPUTED': return colors.disputed;
      default: return '';
    }
  };

  // 获取交易方向对应的文本
  const getDirectionText = (direction: string) => {
    return direction === 'SELL' ? (t.orders?.direction?.SELL || '出售') : (t.orders?.direction?.BUY || '购买');
  };

  // 判断当前用户是否是创建者 - 使用useMemo避免重渲染差异
  const isCreator = useMemo(() => {
    return Boolean(
      currentUserAddress && 
      order.creator?.address && 
      currentUserAddress.toLowerCase() === order.creator.address.toLowerCase()
    );
  }, [currentUserAddress, order.creator?.address]);
  
  // 判断当前用户是否是接受者 - 使用useMemo避免重渲染差异
  const isAccepter = useMemo(() => {
    return Boolean(
      currentUserAddress && 
      order.accepter?.address && 
      currentUserAddress.toLowerCase() === order.accepter.address.toLowerCase()
    );
  }, [currentUserAddress, order.accepter?.address]);

  // 格式化日期 - 使用固定格式避免客户端/服务器差异
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    } catch (e) {
      return '日期无效';
    }
  };

  // 安全地获取创建者显示名称
  const creatorDisplayName = useMemo(() => {
    // 如果订单是匿名发布的
    if (order.isAnonymous) {
      return '匿名用户';
    }
    
    if (order.creator?.name) {
      return order.creator.name;
    }
    if (order.creator?.address && !hideWalletAddress) {
      return `${order.creator.address.slice(0, 6)}...${order.creator.address.slice(-4)}`;
    }
    return '用户';
  }, [order.creator, hideWalletAddress, order.isAnonymous]);

  // 安全地获取物品列表
  const offeringItems = order.offeringItems || [];
  const requestingItems = order.requestingItems || [];

  // 判断是否为精选订单
  const isFeatured = featured || order.title?.includes('【精选】');
  
  // 判断是否为限时订单
  const isTimeLimited = !!order.expiryDate;

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border relative ${isFeatured ? 'border-[#F9D949]' : 'border-[#E8DCD5]'}`}>
      {/* 精选标签 */}
      {isFeatured && (
        <div className="absolute -top-3 -right-3 z-10">
          <Badge className={colors.featured}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            精选
          </Badge>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">
            {isFeatured ? order.title?.replace('【精选】', '') : order.title || '无标题'}
          </h2>
          {order.description && (
            <p className="text-gray-600 mt-1 line-clamp-2">{order.description}</p>
          )}
        </div>
        {/* 调整状态标签的字体大小，与"今日推荐"保持一致 */}
        <Badge className={`${getStatusColor(order.status)} text-md px-3 py-1.5 font-medium`}>
          {getStatusText(order.status)}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F0F4F0] text-[#5A7052]">
          {getDirectionText(order.direction)}
        </span>
        
        {isCreator && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F8F5F2] text-[#8C959E]">
            我发布的
          </span>
        )}
        
        {isAccepter && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F8F5F2] text-[#8C959E]">
            我接受的
          </span>
        )}
        
        {/* 限时订单标签 */}
        {isTimeLimited && timeRemaining && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FFB347] text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            剩余: {timeRemaining}
          </span>
        )}
        
        {/* 匿名发布标签 */}
        {order.isAnonymous && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E6E6FA] text-[#6A5ACD]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            匿名发布
          </span>
        )}
        
        {/* 隐私订单标签 - 只有创建者或接受者才能看到 */}
        {order.isPrivate && (isCreator || isAccepter) && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FFDFD3] text-[#E07A5F]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            隐私订单
          </span>
        )}
        
        {order.escrowStatus && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#EFF2F5] text-[#6A757E]">
            托管: {order.escrowStatus}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-base font-medium text-gray-700 mb-2">{t.orders?.items?.offering || '提供物品'}:</p>
          <ul className="text-base text-gray-600 space-y-1">
            {offeringItems.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-start">
                <span className="text-[#8E9D8A] mr-1">•</span>
                <span>{translateItemName(item.name)} {item.quantity > 1 ? `× ${item.quantity}` : ''}</span>
                {item.estimatedValue && item.currency && (
                  <span className="ml-1 text-gray-500">
                    ({item.estimatedValue} {item.currency})
                  </span>
                )}
              </li>
            ))}
            {offeringItems.length > 3 && (
              <li className="text-[#8C959E]">+{offeringItems.length - 3} 更多物品...</li>
            )}
            {offeringItems.length === 0 && (
              <li className="text-gray-500">无提供物品</li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-base font-medium text-gray-700 mb-2">{t.orders?.items?.requesting || '请求物品'}:</p>
          <ul className="text-base text-gray-600 space-y-1">
            {requestingItems.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-start">
                <span className="text-[#A2B5BB] mr-1">•</span>
                <span>{translateItemName(item.name)} {item.quantity > 1 ? `× ${item.quantity}` : ''}</span>
                {item.estimatedValue && item.currency && (
                  <span className="ml-1 text-gray-500">
                    ({item.estimatedValue} {item.currency})
                  </span>
                )}
              </li>
            ))}
            {requestingItems.length > 3 && (
              <li className="text-[#8C959E]">+{requestingItems.length - 3} 更多物品...</li>
            )}
            {requestingItems.length === 0 && (
              <li className="text-gray-500">无请求物品</li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
        <div className="flex items-center">
          <span className="font-medium mr-1">{t.orders?.creator || '创建者'}:</span>
          <span className="truncate max-w-[150px]">{creatorDisplayName}</span>
        </div>
        <div>
          <span className="font-medium mr-1">{t.orders?.createdAt || '创建时间'}:</span>
            <span>{formatDate(order.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}