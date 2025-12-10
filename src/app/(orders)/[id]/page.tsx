'use client'
import { translateItemName } from '@/lib/itemTranslations';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGetOrder, useAcceptOrder, useCompleteOrder, useGetMe, useDeleteOrder, useGenerateShareToken } from '@/lib/hooks'
import { useAccount } from 'wagmi'
import { TransactionStatus } from '@/components/TransactionStatus'
import type { OrderWithShare } from '@/lib/hooks'
import Spinner from '@/components/ui/Spinner'
import { EscrowFlow } from '@/components/EscrowFlow'
import { useLanguage } from '@/lib/i18n'
import { useNotification } from '@/components/ErrorHandler'
import { Badge } from '@/components/ui/Badge'
import { UserRatingsSection } from '@/components/UserRating'
import { Animate, AnimateList } from '@/components/ui/Animation'
import Link from 'next/link'
import { AuthRequired } from '@/components/AuthRequired'
import LoginPrompt from '@/components/LoginPrompt'

// 莫兰迪色系
const colors = {
  pending: 'bg-[#E8DCD5] text-gray-800',
  accepted: 'bg-[#A2B5BB] text-white',
  completed: 'bg-[#8E9D8A] text-white',
  cancelled: 'bg-[#E98980] text-white',
  disputed: 'bg-[#D8C3A5] text-gray-800',
};

// 格式化钱包地址
const formatAddress = (address: string | undefined, hideWallet = true) => {
  if (!address) return '';
  if (hideWallet) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }
  return address;
};

// 默认订单数据 - 当API请求失败时显示
const defaultOrder = {
  id: 1,
  title: "Nike x Off-White限量联名款",
  description: "全新Nike x Off-White联名款Air Jordan 1芝加哥配色，尺码US10，附带完整包装和吊牌。",
  status: "PENDING",
  direction: "SELL",
  createdAt: new Date().toISOString(),
  creator: {
    id: 1,
    name: "示例卖家",
    address: "0x5678567856785678567856785678567856785678"
  },
  offeringItems: [
    {
      id: 1,
      name: "Nike x Off-White AJ1",
      description: "芝加哥配色，US10码，全新未穿",
      quantity: 1,
      category: "fashion",
      estimatedValue: 30000,
      currency: "CNY"
    }
  ],
  requestingItems: [
    {
      id: 2,
      name: "ETH",
      description: "仅接受ETH支付",
      quantity: 1,
      category: "cryptocurrency",
      estimatedValue: 30000,
      currency: "CNY"
    }
  ]
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { t } = useLanguage()
  
  // 确保订单ID是有效的数字
  const orderId = parseInt(params.id);
  const isValidOrderId = !isNaN(orderId) && orderId > 0;
  
  // API Hooks - 只有在ID有效时才调用API
  const { data: me } = useGetMe()
  const { mutateAsync: acceptOrder, isPending: loadingAccept } = useAcceptOrder()
  const { mutateAsync: completeOrder, isPending: loadingComplete } = useCompleteOrder()
  const { mutateAsync: deleteOrder, isPending: loadingDelete } = useDeleteOrder()
  const { mutateAsync: generateShareToken, isPending: loadingShare } = useGenerateShareToken()
  
  // 修复：只传递一个参数给useGetOrder
  const { 
    data: orderData, 
    refetch: refetchOrder, 
    isLoading: loadingOrder, 
    error: orderError 
  } = useGetOrder(isValidOrderId ? orderId : 0)
  
  // 通知系统
  const { showSuccess, showError, NotificationDisplay } = useNotification()
  
  // 本地状态
  const [order, setOrder] = useState<OrderWithShare | null>(null)
  const [isAuthError, setIsAuthError] = useState(false)
  const [hideWalletAddress, setHideWalletAddress] = useState(true)
  const [useFallbackData, setUseFallbackData] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [shareExpiry, setShareExpiry] = useState<string | null>(null)
  const [shareTokenExpiryDays, setShareTokenExpiryDays] = useState(7)
  
  // 模拟评价数据
  const [ratings, setRatings] = useState<Array<{
    id: number;
    rating: number;
    comment?: string;
    userName: string;
    date: string;
  }>>([]);
  
  // 是否已经评价
  const [hasRated, setHasRated] = useState(false);

  // 处理无效订单ID
  useEffect(() => {
    if (!isValidOrderId) {
      console.error('无效的订单ID:', params.id);
    }
  }, [params.id, isValidOrderId]);

  // 当 orderData 更新时更新本地状态
  useEffect(() => {
    if (orderData) {
      setOrder(orderData)
      setIsAuthError(false)
      setUseFallbackData(false)
      
      // 如果订单已完成，模拟获取评价数据
      if (orderData.status === 'COMPLETED') {
        // 这里应该从API获取评价数据
        // 暂时使用模拟数据
        if (ratings.length === 0) {
          const mockRatings = [];
          // 随机生成0-2条评价
          const ratingCount = Math.floor(Math.random() * 2);
          for (let i = 0; i < ratingCount; i++) {
            mockRatings.push({
              id: i + 1,
              rating: 4 + Math.floor(Math.random() * 2), // 4-5星
              comment: '交易非常顺利，对方很守信用，物品质量也很好！',
              userName: orderData.creator.name || '用户' + Math.floor(Math.random() * 1000),
              date: new Date(Date.now() - Math.random() * 86400000 * 5).toLocaleDateString()
            });
          }
          setRatings(mockRatings);
        }
      }
    } else if (orderError) {
      console.error('订单加载错误:', orderError);
      
      // 如果API返回错误，检查是否是认证错误
      if (orderError.message?.includes('unauthorized') || 
          orderError.message?.includes('登录') || 
          orderError.message?.includes('403') || 
          orderError.message?.includes('Forbidden')) {
        setIsAuthError(true);
      }
    }
  }, [orderData, orderError, params.id, ratings.length]);

  // 处理接受订单
  const handleAccept = async () => {
    if (!order || useFallbackData) {
      showError(new Error('请先登录并认证您的钱包'), '需要认证')
      return
    }
    
    try {
      const updated = await acceptOrder({ orderId: order.id })
      setOrder(updated)
      showSuccess(t.orders?.messages?.acceptSuccess || '成功接受订单')
      refetchOrder() // 刷新订单数据
    } catch (err: any) {
      showError(err, t.errors?.general || '操作失败')
    }
  }

  // 处理完成订单
  const handleComplete = async () => {
    if (!order || useFallbackData) {
      showError(new Error('请先登录并认证您的钱包'), '需要认证')
      return
    }
    
    try {
      const updated = await completeOrder({ orderId: order.id })
      setOrder(updated)
      showSuccess(t.orders?.messages?.completeSuccess || '成功完成订单')
      refetchOrder() // 刷新订单数据
    } catch (err: any) {
      showError(err, t.errors?.general || '操作失败')
    }
  }

  // 处理删除订单
  const handleDelete = async () => {
    if (!order || useFallbackData) {
      showError(new Error('请先登录并认证您的钱包'), '需要认证')
      return
    }
    
    try {
      await deleteOrder({ orderId: order.id })
      showSuccess('订单已成功删除')
      // 删除成功后返回订单列表
      router.push('/orders')
    } catch (err: any) {
      showError(err, '删除订单失败')
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  // 处理生成分享链接
  const handleGenerateShareLink = async () => {
    if (!order) return
    
    try {
      const result = await generateShareToken({ 
        orderId: order.id,
        expiryDays: shareTokenExpiryDays
      })
      
      // 生成完整的分享链接
      const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:3000'
      const token = result?.shareToken
      
      if (token) {
        // 修正分享链接格式，确保可以正确打开
        const link = `${origin}/orders/${order.id}?t=${token}`
        setShareLink(link)
        
        // 设置过期时间显示
        if (result?.shareTokenExpiresAt) {
          setShareExpiry(new Date(result.shareTokenExpiresAt).toLocaleString('zh-CN'))
        }
        
        await refetchOrder() // 刷新订单数据以获取最新的分享令牌
      } else {
        showError(new Error('无法生成分享链接'), '操作失败')
      }
    } catch (err: any) {
      showError(err, '生成分享链接失败')
    }
  }

  // 托管更新处理函数
  const handleEscrowUpdated = async () => {
    await refetchOrder()
  }
  
  // 评价提交处理函数
  const handleRatingSubmitted = () => {
    setHasRated(true);
    // 这里应该刷新评价数据
    // 暂时使用模拟数据
    setRatings(prev => [
      ...prev,
      {
        id: prev.length + 1,
        rating: 5,
        comment: '非常满意的一次交易！',
        userName: me?.name || '我',
        date: new Date().toLocaleDateString()
      }
    ]);
  }

  // 处理无效订单ID
  if (!isValidOrderId) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">无效的订单ID</h2>
          <p className="mb-4">提供的订单ID "{params.id}" 无效，请检查链接是否正确</p>
          <Link 
            href="/orders" 
            className="px-4 py-2 bg-[#A2B5BB] text-white rounded hover:bg-[#8FA3A9] inline-block"
          >
            返回订单列表
          </Link>
        </div>
      </div>
    );
  }

  // 加载状态
  if (loadingOrder && !order) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <Spinner size={40} />
          <p className="mt-4 text-gray-600 text-lg">{t.common?.loading || '加载中...'}</p>
        </div>
      </div>
    )
  }

  // 未登录状态 - 显示登录提示
  if (isAuthError || !me) {
    return <LoginPrompt />
  }

  // 订单不存在
  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">未找到订单</h2>
          <p className="mb-4">抱歉，无法找到ID为 {params.id} 的订单信息</p>
          <Link 
            href="/orders" 
            className="px-4 py-2 bg-[#A2B5BB] text-white rounded hover:bg-[#8FA3A9] inline-block"
          >
            返回订单列表
          </Link>
        </div>
      </div>
    )
  }

  // 判断当前用户角色 - 修改判断逻辑，确保正确识别创建者
  // 检查当前用户是否是订单创建者，不区分大小写
  const isCreator = address && order?.creator?.address 
    ? address.toLowerCase() === order.creator.address.toLowerCase() 
    : false;
    
  // 调试信息，帮助排查问题
  console.log('当前用户地址:', address);
  console.log('订单创建者地址:', order?.creator?.address);
  console.log('是否是创建者:', isCreator);
  
  const isAccepter = order?.accepter && address 
    ? address.toLowerCase() === order.accepter.address.toLowerCase() 
    : false;
  const isParticipant = isCreator || isAccepter;

  // 订单状态对应的文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return t.orders?.status?.PENDING || '等待中'
      case 'ACCEPTED': return t.orders?.status?.ACCEPTED || '已接受'
      case 'COMPLETED': return t.orders?.status?.COMPLETED || '已完成'
      case 'CANCELLED': return t.orders?.status?.CANCELLED || '已取消'
      case 'DISPUTED': return t.orders?.status?.DISPUTED || '有争议'
      default: return status
    }
  }

  // 订单状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return colors.pending
      case 'ACCEPTED': return colors.accepted
      case 'COMPLETED': return colors.completed
      case 'CANCELLED': return colors.cancelled
      case 'DISPUTED': return colors.disputed
      default: return 'bg-gray-200 text-gray-800'
    }
  }
  
  // 判断是否可以评价 - 确保返回布尔值
  const canRate = Boolean(order?.status === 'COMPLETED' && isParticipant && !hasRated);
  
  // 获取评价目标用户
  const getTargetUser = () => {
    if (!order) return null;
    
    if (isCreator && order.accepter) {
      return {
        id: order.accepter.id,
        name: order.accepter.name || '用户' + order.accepter.id
      };
    } else if (isAccepter) {
      return {
        id: order.creator.id,
        name: order.creator.name || '用户' + order.creator.id
      };
    }
    return null;
  };
  
  const targetUser = getTargetUser();

  // 将 escrowStatus 转换为 TransactionStatus 组件需要的类型
  const getTransactionStatus = (status?: string | null): "pending" | "confirmed" | "failed" | undefined => {
    if (!status) return "pending";
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("complete") || lowerStatus === "completed") {
      return "confirmed";
    } else if (lowerStatus.includes("fail") || lowerStatus === "cancelled" || lowerStatus === "disputed") {
      return "failed";
    } else {
      return "pending";
    }
  };

  // 渲染订单详情内容
  const renderOrderDetails = () => {
    if (!order) return null;
    
    return (
      <>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{order.title}</h1>
              <p className="text-gray-600">{order.description || '无描述'}</p>
              
              {/* 添加私密订单和过期时间标记 */}
              {order.isPrivate && (
                <div className="mt-2 flex items-center">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    私密订单
                  </span>
                  
                  {order.expiryDate && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(order.expiryDate) > new Date() 
                        ? `过期时间: ${new Date(order.expiryDate).toLocaleDateString()}` 
                        : '已过期'}
                    </span>
                  )}
                </div>
              )}
            </div>
            {/* 只显示状态文本，不显示"订单状态"四个字 */}
            <Badge className={`${getStatusColor(order.status)} text-xl px-4 py-2 font-medium`}>
              {getStatusText(order.status)}
            </Badge>
          </div>

          {/* 托管状态 - 只有当托管状态存在且不是隐私订单时显示 */}
          {order.escrowStatus && !order.isPrivate && (
            <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-blue-700">托管状态: {order.escrowStatus}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 py-5 border-y border-gray-200 mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">创建者</h3>
              {/* 即使是匿名订单，也显示不同的名称 */}
              <p className="text-gray-800 font-medium">
                {order.isAnonymous 
                  ? (order.creator?.name || `用户${order.creator?.id || Math.floor(Math.random() * 1000)}`) 
                  : (order.creator?.name || `用户${order.creator?.id || Math.floor(Math.random() * 1000)}`)}
              </p>
              {order.creator?.address && !order.isAnonymous && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatAddress(order.creator.address, hideWalletAddress)}
                  {hideWalletAddress && (
                    <button 
                      onClick={() => setHideWalletAddress(false)}
                      className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                    >
                      显示
                    </button>
                  )}
                </p>
              )}
            </div>
            {order.accepter && (
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">接受者</h3>
                <p className="text-gray-800 font-medium">
                  {order.accepter.name || `用户${order.accepter.id || Math.floor(Math.random() * 1000)}`}
                </p>
                {order.accepter.address && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatAddress(order.accepter.address, hideWalletAddress)}
                    {hideWalletAddress && (
                      <button 
                        onClick={() => setHideWalletAddress(false)}
                        className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                      >
                        显示
                      </button>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">提供物品</h3>
              <div className="space-y-3">
                {/* 添加对 order.offeringItems 的空值检查 */}
                {order.offeringItems && order.offeringItems.length > 0 ? (
                  order.offeringItems.map((item) => (
                    <div key={item.id} className="p-4 bg-[#EFF2F5] rounded-lg border border-[#E8DCD5]">
                      <p className="font-medium text-gray-800">{translateItemName(item.name)}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        {item.quantity && <span>数量: {item.quantity} {item.unit || ''}</span>}
                        {item.estimatedValue && (
                          <span>{item.estimatedValue} {item.currency || 'CNY'}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">无提供物品</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">请求物品</h3>
              <div className="space-y-3">
                {/* 添加对 order.requestingItems 的空值检查 */}
                {order.requestingItems && order.requestingItems.length > 0 ? (
                  order.requestingItems.map((item) => (
                    <div key={item.id} className="p-4 bg-[#F0F4F0] rounded-lg border border-[#D8E6D8]">
                      <p className="font-medium text-gray-800">{translateItemName(item.name)}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        {item.quantity && <span>数量: {item.quantity} {item.unit || ''}</span>}
                        {item.estimatedValue && (
                          <span>{item.estimatedValue} {item.currency || 'CNY'}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">无请求物品</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="font-medium">创建时间：</span>
              <span>{new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
              
              {order.acceptedAt && (
                <span className="ml-4">
                  <span className="font-medium">接受时间：</span>
                  <span>{new Date(order.acceptedAt).toLocaleDateString('zh-CN')}</span>
                </span>
              )}
            </div>
            
            <div className="mt-4 sm:mt-0 flex gap-2">
              {/* 删除订单按钮 - 只有创建者且订单状态为等待中时可见 */}
              {order.status === 'PENDING' && isCreator && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-base font-medium rounded transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除
                </button>
              )}
              
              {/* 分享订单按钮 - 始终显示，方便调试 */}
              <button
                onClick={() => {
                  console.log('点击分享按钮');
                  console.log('当前用户地址:', address);
                  console.log('订单创建者地址:', order.creator?.address);
                  console.log('是否是创建者:', isCreator);
                  setShowShareModal(true);
                }}
                className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                分享
              </button>
              
              {/* 接受订单按钮 - 确保自己创建的订单不显示接受按钮 */}
              {order.status === 'PENDING' && isConnected && !isCreator && !isAccepter && (
                <button
                  onClick={handleAccept}
                  disabled={loadingAccept}
                  className="py-2 px-4 bg-[#A2B5BB] hover:bg-[#8FA3A9] disabled:bg-gray-300 text-white text-base font-medium rounded transition flex items-center"
                >
                  {loadingAccept ? (
                    <>
                      <Spinner size={16} className="mr-2" /> 处理中...
                    </>
                  ) : (
                    '接受订单'
                  )}
                </button>
              )}

              {/* 完成订单按钮 */}
              {order.status === 'ACCEPTED' && isParticipant && (
                <button
                  onClick={handleComplete}
                  disabled={loadingComplete || !isConnected}
                  className="py-2 px-4 bg-[#8E9D8A] hover:bg-[#7A8976] disabled:bg-gray-300 text-white text-base font-medium rounded transition flex items-center"
                >
                  {loadingComplete ? (
                    <>
                      <Spinner size={16} className="mr-2" /> 处理中...
                    </>
                  ) : (
                    '完成订单'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* 托管组件 - 仅在订单已接受时显示，且不是隐私订单 */}
        {order.status === 'ACCEPTED' && !order.isPrivate && (
          <div className="mb-6">
            <EscrowFlow
              orderId={order.id}
              accepterAddress={order.accepter?.address || ''}
              creatorAddress={order.creator.address || ''}
              currentUserAddress={address || ''}
              escrowId={order.escrowId ? Number(order.escrowId) : undefined}
              escrowStatus={order.escrowStatus || undefined}
              escrowAddress={order.escrowAddress || undefined}
              escrowTxHash={order.escrowTxHash || undefined}
              onEscrowUpdated={handleEscrowUpdated}
            />
          </div>
        )}

        {/* 交易状态 - 仅在有交易哈希时显示，且不是隐私订单 */}
        {order.escrowTxHash && !order.isPrivate && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">交易状态</h3>
            <TransactionStatus
              txHash={order.escrowTxHash}
              status={getTransactionStatus(order.escrowStatus)}
              confirmations={0}
              requiredConfirmations={12}
              chainId={11155111} // Sepolia
            />
          </div>
        )}
        
        {/* 用户评价区域 - 仅在订单已完成时显示 */}
        {order.status === 'COMPLETED' && targetUser && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <UserRatingsSection
              orderId={order.id}
              ratings={ratings}
              canRate={canRate}
              targetUserId={targetUser.id}
              targetUserName={targetUser.name}
              onRatingSubmitted={handleRatingSubmitted}
            />
          </div>
        )}
        
        {/* 分享订单弹窗 */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">分享订单</h3>
                <button 
                  onClick={() => {
                    setShowShareModal(false)
                    setShareLink(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {!shareLink ? (
                <>
                  <p className="text-gray-600 mb-4">
                    生成一个可分享的链接，即使是私密订单，拥有此链接的人也可以查看。
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">链接有效期</label>
                    <select
                      value={shareTokenExpiryDays}
                      onChange={(e) => setShareTokenExpiryDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1天</option>
                      <option value={7}>7天</option>
                      <option value={30}>30天</option>
                      <option value={0}>永不过期</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleGenerateShareLink}
                      disabled={loadingShare}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
                    >
                      {loadingShare ? (
                        <>
                          <Spinner size={16} className="mr-2" /> 生成中...
                        </>
                      ) : (
                        '生成链接'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    分享此链接，对方可直接访问此订单：
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink)
                          showSuccess('链接已复制到剪贴板')
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                      >
                        复制
                      </button>
                    </div>
                    {shareExpiry && (
                      <p className="mt-1 text-sm text-gray-500">链接有效期至: {shareExpiry}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowShareModal(false)
                        setShareLink(null)
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      关闭
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* 删除确认弹窗 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-800">确认删除</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                您确定要删除此订单吗？此操作不可撤销。
              </p>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loadingDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 flex items-center"
                >
                  {loadingDelete ? (
                    <>
                      <Spinner size={16} className="mr-2" /> 删除中...
                    </>
                  ) : (
                    '确认删除'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-[#8C959E] hover:text-[#6A757E] flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回
        </button>

        {/* 订单详情 */}
        {renderOrderDetails()}
      </div>
      
      {/* 通知组件 */}
      <NotificationDisplay />
    </div>
  )
}