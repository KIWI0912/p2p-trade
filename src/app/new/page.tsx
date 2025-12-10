'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateOrder, useGetMe } from '@/lib/hooks'
import { TradeDirection } from '@/lib/types'
import { useLanguage } from '@/lib/i18n'
import { useAccount, useBalance } from 'wagmi'
import Link from 'next/link'
import Spinner from '@/components/ui/Spinner'
import { useNotification } from '@/components/ErrorHandler'

// 汇率转换 (模拟数据)
const EXCHANGE_RATES = {
  ETH: { USD: 3500, CNY: 25000 },
  USDT: { USD: 1, CNY: 7.15 },
  USDC: { USD: 1, CNY: 7.15 },
  DAI: { USD: 1, CNY: 7.15 },
  BTC: { USD: 65000, CNY: 465000 },
}

interface OrderItem {
  name: string
  description?: string
  quantity: number
  unit?: string
  estimatedValue?: string
  currency: string
  category?: string
}

// 预定义的加密货币选项
const CRYPTO_OPTIONS = [
  { name: 'ETH', category: 'cryptocurrency' },
  { name: 'USDT', category: 'cryptocurrency' },
  { name: 'USDC', category: 'cryptocurrency' },
  { name: 'DAI', category: 'cryptocurrency' },
  { name: 'BTC', category: 'cryptocurrency' },
]

// 预定义的物品类别
const ITEM_CATEGORIES = [
  { value: 'electronics', label: '电子产品' },
  { value: 'fashion', label: '服装/配饰' },
  { value: 'collectibles', label: '收藏品' },
  { value: 'services', label: '服务' },
  { value: 'digital', label: '数字商品' },
  { value: 'cryptocurrency', label: '加密货币' },
  { value: 'real_estate', label: '房产' },
  { value: 'vehicles', label: '车辆' },
  { value: 'other', label: '其他' },
]

export default function NewOrderPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({
    address,
    watch: true,
  })
  const { data: me, isLoading: loadingMe } = useGetMe()
  const { NotificationDisplay, showSuccess, showError } = useNotification()
  
  const { mutateAsync: createOrder, isPending: loading } = useCreateOrder()
  const [isPrivate, setIsPrivate] = useState(false)
  const [expiryDays, setExpiryDays] = useState<number | null>(7)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [shareExpiry, setShareExpiry] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [direction, setDirection] = useState<TradeDirection>(TradeDirection.SELL)
  
  // 初始物品设置
  const [offeringItems, setOfferingItems] = useState<OrderItem[]>([
    { 
      name: '', 
      description: '',
      quantity: 1, 
      currency: 'ETH',
      estimatedValue: '',
      category: 'cryptocurrency' 
    },
  ])
  
  const [requestingItems, setRequestingItems] = useState<OrderItem[]>([
    { 
      name: '', 
      description: '',
      quantity: 1, 
      currency: 'CNY',
      estimatedValue: '',
      category: 'cryptocurrency' 
    },
  ])

  // 处理钱包余额变化
  useEffect(() => {
    if (balanceData && direction === TradeDirection.SELL) {
      // 如果用户选择出售，将ETH添加为默认提供物品选项
      setOfferingItems([{
        name: 'ETH',
        description: '以太坊代币',
        quantity: 1,
        unit: 'ETH',
        estimatedValue: balanceData.formatted,
        currency: 'ETH',
        category: 'cryptocurrency'
      }]);
      
      // 自动计算等值的CNY
      const ethValue = parseFloat(balanceData.formatted);
      const cnyValue = (ethValue * EXCHANGE_RATES.ETH.CNY).toFixed(2);
      
      setRequestingItems([{
        name: '现金',
        description: '人民币现金',
        quantity: 1,
        unit: 'CNY',
        estimatedValue: cnyValue,
        currency: 'CNY',
        category: 'cash'
      }]);
    }
  }, [balanceData, direction]);

  // 计算等值货币
  const calculateEquivalent = (value: string, fromCurrency: string, toCurrency: string) => {
    if (!value || isNaN(parseFloat(value))) return '';
    
    const numValue = parseFloat(value);
    
    // 如果货币相同，直接返回
    if (fromCurrency === toCurrency) return value;
    
    // 先转换为USD
    let usdValue = 0;
    if (EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES]) {
      usdValue = numValue * EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES].USD;
    } else {
      // 假设其他货币是CNY
      usdValue = numValue / 7.15;
    }
    
    // 从USD转换为目标货币
    if (EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES]) {
      return (usdValue / EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES].USD).toFixed(6);
    } else {
      // 假设目标货币是CNY
      return (usdValue * 7.15).toFixed(2);
    }
  };

  // 处理物品值变化，自动计算等值货币
  const handleValueChange = (type: 'offering' | 'requesting', index: number, value: string) => {
    const items = type === 'offering' ? [...offeringItems] : [...requestingItems];
    items[index].estimatedValue = value;
    
    if (type === 'offering') {
      setOfferingItems(items);
      
      // 自动更新请求物品的值
      if (requestingItems.length > 0 && items[index].currency && items[index].estimatedValue) {
        const newValue = calculateEquivalent(
          items[index].estimatedValue,
          items[index].currency,
          requestingItems[0].currency
        );
        
        const updatedRequestItems = [...requestingItems];
        updatedRequestItems[0].estimatedValue = newValue;
        setRequestingItems(updatedRequestItems);
      }
    } else {
      setRequestingItems(items);
      
      // 自动更新提供物品的值
      if (offeringItems.length > 0 && items[index].currency && items[index].estimatedValue) {
        const newValue = calculateEquivalent(
          items[index].estimatedValue,
          items[index].currency,
          offeringItems[0].currency
        );
        
        const updatedOfferingItems = [...offeringItems];
        updatedOfferingItems[0].estimatedValue = newValue;
        setOfferingItems(updatedOfferingItems);
      }
    }
  };

  // 处理货币类型变化，自动重新计算值
  const handleCurrencyChange = (type: 'offering' | 'requesting', index: number, currency: string) => {
    const items = type === 'offering' ? [...offeringItems] : [...requestingItems];
    
    // 保存旧货币和值
    const oldCurrency = items[index].currency;
    const oldValue = items[index].estimatedValue;
    
    // 更新货币
    items[index].currency = currency;
    
    // 如果有值，重新计算
    if (oldValue && !isNaN(parseFloat(oldValue))) {
      items[index].estimatedValue = calculateEquivalent(oldValue, oldCurrency, currency);
    }
    
    if (type === 'offering') {
      setOfferingItems(items);
      
      // 自动更新请求物品的值
      if (requestingItems.length > 0 && items[index].estimatedValue) {
        const newValue = calculateEquivalent(
          items[index].estimatedValue,
          currency,
          requestingItems[0].currency
        );
        
        const updatedRequestItems = [...requestingItems];
        updatedRequestItems[0].estimatedValue = newValue;
        setRequestingItems(updatedRequestItems);
      }
    } else {
      setRequestingItems(items);
      
      // 自动更新提供物品的值
      if (offeringItems.length > 0 && items[index].estimatedValue) {
        const newValue = calculateEquivalent(
          items[index].estimatedValue,
          currency,
          offeringItems[0].currency
        );
        
        const updatedOfferingItems = [...offeringItems];
        updatedOfferingItems[0].estimatedValue = newValue;
        setOfferingItems(updatedOfferingItems);
      }
    }
  };

  // 处理加密货币选择
  const handleCryptoSelect = (type: 'offering' | 'requesting', crypto: string) => {
    const items = type === 'offering' ? [...offeringItems] : [...requestingItems];
    
    // 更新第一个物品为选择的加密货币
    items[0] = {
      name: crypto,
      description: `${crypto} 加密货币`,
      quantity: 1,
      unit: crypto,
      estimatedValue: type === 'offering' && crypto === 'ETH' && balanceData ? balanceData.formatted : '',
      currency: crypto,
      category: 'cryptocurrency'
    };
    
    if (type === 'offering') {
      setOfferingItems(items);
      
      // 自动更新请求物品的值
      if (requestingItems.length > 0 && items[0].estimatedValue) {
        const newValue = calculateEquivalent(
          items[0].estimatedValue,
          crypto,
          requestingItems[0].currency
        );
        
        const updatedRequestItems = [...requestingItems];
        updatedRequestItems[0].estimatedValue = newValue;
        setRequestingItems(updatedRequestItems);
      }
    } else {
      setRequestingItems(items);
      
      // 自动更新提供物品的值
      if (offeringItems.length > 0 && offeringItems[0].estimatedValue) {
        const newValue = calculateEquivalent(
          offeringItems[0].estimatedValue,
          offeringItems[0].currency,
          crypto
        );
        
        const updatedRequestItems = [...items];
        updatedRequestItems[0].estimatedValue = newValue;
        setRequestingItems(updatedRequestItems);
      }
    }
  };

  // 处理现金选择
  const handleCashSelect = (type: 'offering' | 'requesting', currency: string = 'CNY') => {
    const items = type === 'offering' ? [...offeringItems] : [...requestingItems];
    
    // 更新第一个物品为现金
    items[0] = {
      name: '现金',
      description: currency === 'CNY' ? '人民币现金' : '美元现金',
      quantity: 1,
      unit: currency,
      estimatedValue: '',
      currency: currency,
      category: 'cash'
    };
    
    if (type === 'offering') {
      setOfferingItems(items);
    } else {
      setRequestingItems(items);
    }
  };

  // 处理自定义物品
  const handleCustomItem = (type: 'offering' | 'requesting') => {
    const items = type === 'offering' ? [...offeringItems] : [...requestingItems];
    
    // 更新第一个物品为自定义
    items[0] = {
      name: '',
      description: '',
      quantity: 1,
      unit: '',
      estimatedValue: '',
      currency: 'CNY',
      category: ''
    };
    
    if (type === 'offering') {
      setOfferingItems(items);
    } else {
      setRequestingItems(items);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('请输入标题')
      return
    }

    if (offeringItems.some((item) => !item.name.trim())) {
      setError('请为所有提供的物品填写名称')
      return
    }

    if (offeringItems.some((item) => !item.category || !item.category.trim())) {
      setError('请为所有提供的物品选择类别')
      return
    }

    if (requestingItems.some((item) => !item.name.trim())) {
      setError('请为所有要求的物品填写名称')
      return
    }

    if (requestingItems.some((item) => !item.category || !item.category.trim())) {
      setError('请为所有要求的物品选择类别')
      return
    }

    try {
      const newOrder = await createOrder({
        title,
        description,
        direction,
        isPrivate,
        expiryDays,
        offeringItems: offeringItems.map((item) => ({
          ...item,
          estimatedValue: item.estimatedValue ? parseFloat(item.estimatedValue) : undefined,
        })),
        requestingItems: requestingItems.map((item) => ({
          ...item,
          estimatedValue: item.estimatedValue ? parseFloat(item.estimatedValue) : undefined,
        })),
      })
      
      // 如果后端返回 shareToken（后端支持私密分享），则在链接中包含，否则展示基础链接并提示
      const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:3000'
      const token = newOrder?.shareToken || null
      const expiresAt = newOrder?.shareTokenExpiresAt
      
      // 保存token以便后续使用，确保不是undefined
      setShareToken(token)
      
      // Validate that we have an order ID
      if (!newOrder?.id) {
        throw new Error('订单创建成功，但无法获取订单ID');
      }
      
      // 修改链接格式，确保使用正确的路由和包含token
      // 只有当token是有效字符串时才添加到URL中
      const link = token && typeof token === 'string' && token !== 'undefined' 
        ? `${origin}/orders/${newOrder.id}?t=${token}` 
        : `${origin}/orders/${newOrder.id}`
      setShareLink(link)
      
      // 如果有过期时间，保留在状态中以便渲染
      if (expiresAt) setShareExpiry(new Date(expiresAt).toLocaleString('zh-CN'))
      else setShareExpiry(null)
      setCreatedOrderId(newOrder.id)
      showSuccess('订单创建成功')
      setSuccessMessage('订单已创建成功！')
      // 不立即跳转，让用户复制或查看
    } catch (err: any) {
      showError(err, '创建订单失败')
      setError(err.message || '创建订单失败')
    }
  }

  // 如果正在加载用户信息，显示加载状态
  if (loadingMe) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <Spinner size={40} />
          <p className="mt-4 text-gray-600 text-lg">正在检查登录状态...</p>
        </div>
      </div>
    )
  }

  // 如果未登录，显示登录提示
  if (!isConnected || !me) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">需要登录</h2>
          <p className="text-gray-600 mb-6 text-center">
            创建订单前请先连接钱包并登录系统。
          </p>
          <Link 
            href="/login" 
            className="block w-full py-2 px-4 bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white text-center font-medium rounded-lg"
          >
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">创建新订单</h1>
          <Link 
            href="/orders/my-orders" 
            className="text-[#A2B5BB] hover:text-[#8FA3A9] flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            查看我的订单
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">订单详情</h2>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">订单标题 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="例如：出售全新MacBook Pro"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">订单描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="详细描述交易内容、物品状态、交易方式等"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">交易方向 *</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as TradeDirection)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value={TradeDirection.SELL}>我要出售</option>
                <option value={TradeDirection.BUY}>我要购买</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input 
                id="isPrivate" 
                type="checkbox" 
                checked={isPrivate} 
                onChange={(e) => setIsPrivate(e.target.checked)} 
                className="h-5 w-5" 
              />
              <label htmlFor="isPrivate" className="text-base text-gray-700">
                创建私密订单（仅通过链接分享）
              </label>
            </div>

            {isPrivate && (
              <div className="mt-2">
                <label className="block text-base font-medium text-gray-700 mb-1">
                  链接有效期
                </label>
                <select 
                  value={expiryDays ?? 0} 
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))} 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-base"
                >
                  <option value={1}>1 天</option>
                  <option value={7}>7 天（推荐）</option>
                  <option value={30}>30 天</option>
                  <option value={0}>永不过期</option>
                </select>
              </div>
            )}
          </div>

          {/* 提供的物品 */}
          <div className="space-y-4 p-5 bg-[#F0F4F0] rounded-lg border border-[#D8E6D8]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {direction === TradeDirection.SELL ? '我提供的物品/服务' : '我想要的物品/服务'}
              </h2>
              
              {/* 钱包余额信息 */}
              {balanceData && direction === TradeDirection.SELL && (
                <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded border border-gray-200">
                  钱包余额: {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="mb-4">
                <label className="block text-base font-medium text-gray-700 mb-2">选择物品类型</label>
                <div className="flex flex-wrap gap-2">
                  {CRYPTO_OPTIONS.map(crypto => (
                    <button
                      key={crypto.name}
                      type="button"
                      onClick={() => handleCryptoSelect('offering', crypto.name)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        offeringItems[0].name === crypto.name && offeringItems[0].category === 'cryptocurrency'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {crypto.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleCashSelect('offering')}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      offeringItems[0].name === '现金' && offeringItems[0].category === 'cash'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    现金
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomItem('offering')}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      !offeringItems[0].name || (offeringItems[0].name !== '现金' && !CRYPTO_OPTIONS.some(c => c.name === offeringItems[0].name))
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    自定义物品
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">物品名称 *</label>
                    <input
                      type="text"
                      value={offeringItems[0].name}
                      onChange={(e) => {
                        const items = [...offeringItems];
                        items[0].name = e.target.value;
                        setOfferingItems(items);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                      placeholder="输入物品名称"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">物品类别</label>
                    <select
                      value={offeringItems[0].category || ''}
                      onChange={(e) => {
                        const items = [...offeringItems];
                        items[0].category = e.target.value;
                        setOfferingItems(items);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                    >
                      <option value="">选择类别</option>
                      {ITEM_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <input
                    type="text"
                    value={offeringItems[0].description || ''}
                    onChange={(e) => {
                      const items = [...offeringItems];
                      items[0].description = e.target.value;
                      setOfferingItems(items);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                    placeholder="物品描述（可选）"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                    <input
                      type="number"
                      value={offeringItems[0].quantity}
                      onChange={(e) => {
                        const items = [...offeringItems];
                        items[0].quantity = parseInt(e.target.value) || 1;
                        setOfferingItems(items);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">单位（可选）</label>
                    <input
                      type="text"
                      value={offeringItems[0].unit || ''}
                      onChange={(e) => {
                        const items = [...offeringItems];
                        items[0].unit = e.target.value;
                        setOfferingItems(items);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                      placeholder="个/件/台"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价值估计</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={offeringItems[0].estimatedValue || ''}
                      onChange={(e) => handleValueChange('offering', 0, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-base"
                      placeholder="输入估计价值"
                    />
                    <select
                      value={offeringItems[0].currency}
                      onChange={(e) => handleCurrencyChange('offering', 0, e.target.value)}
                      className="px-3 py-2 border-l-0 border border-gray-300 rounded-r text-base bg-gray-50 w-24"
                    >
                      <option value="CNY">CNY</option>
                      <option value="USD">USD</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                    </select>
                  </div>
                  
                  {offeringItems[0].estimatedValue && (
                    <div className="mt-1 text-sm text-gray-500">
                      约合 
                      {offeringItems[0].currency !== 'CNY' 
                        ? ` ${calculateEquivalent(offeringItems[0].estimatedValue, offeringItems[0].currency, 'CNY')} CNY` 
                        : ` ${calculateEquivalent(offeringItems[0].estimatedValue, offeringItems[0].currency, 'USD')} USD`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 要求的物品 */}
          <div className="space-y-4 p-5 bg-[#EFF2F5] rounded-lg border border-[#E8DCD5]">
            <h2 className="text-xl font-semibold text-gray-800">
              {direction === TradeDirection.SELL ? '我想要的物品/服务' : '我提供的物品/服务'}
            </h2>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="mb-4">
                <label className="block text-base font-medium text-gray-700 mb-2">选择物品类型</label>
                <div className="flex flex-wrap gap-2">
                  {CRYPTO_OPTIONS.map(crypto => (
                    <button
                      key={crypto.name}
                      type="button"
                      onClick={() => handleCryptoSelect('requesting', crypto.name)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        requestingItems[0].name === crypto.name && requestingItems[0].category === 'cryptocurrency'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {crypto.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleCashSelect('requesting')}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      requestingItems[0].name === '现金' && requestingItems[0].category === 'cash'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    现金
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomItem('requesting')}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      !requestingItems[0].name || (requestingItems[0].name !== '现金' && !CRYPTO_OPTIONS.some(c => c.name === requestingItems[0].name))
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    自定义物品
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">物品名称 *</label>
                    <input
                      type="text"
                      value={requestingItems[0].name}
                      onChange={(e) => {
                        const items = [...requestingItems];
                        items[0].name = e.target.value;
                        setRequestingItems(items);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                      placeholder="输入物品名称"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">物品类别</label>
                    <select
                      value={requestingItems[0].category || ''}
                      onChange={(e) => {
                        const items = [...requestingItems];
                        items[0].category = e.target.value;
                        setRequestingItems(items);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                    >
                      <option value="">选择类别</option>
                      {ITEM_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <input
                    type="text"
                    value={requestingItems[0].description || ''}
                    onChange={(e) => {
                      const items = [...requestingItems];
                      items[0].description = e.target.value;
                      setRequestingItems(items);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                    placeholder="物品描述（可选）"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                    <input
                      type="number"
                      value={requestingItems[0].quantity}
                      onChange={(e) => {
                        const items = [...requestingItems];
                        items[0].quantity = parseInt(e.target.value) || 1;
                        setRequestingItems(items);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">单位（可选）</label>
                    <input
                      type="text"
                      value={requestingItems[0].unit || ''}
                      onChange={(e) => {
                        const items = [...requestingItems];
                        items[0].unit = e.target.value;
                        setRequestingItems(items);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                      placeholder="个/件/台"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价值估计</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={requestingItems[0].estimatedValue || ''}
                      onChange={(e) => handleValueChange('requesting', 0, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-base"
                      placeholder="输入估计价值"
                    />
                    <select
                      value={requestingItems[0].currency}
                      onChange={(e) => handleCurrencyChange('requesting', 0, e.target.value)}
                      className="px-3 py-2 border-l-0 border border-gray-300 rounded-r text-base bg-gray-50 w-24"
                    >
                      <option value="CNY">CNY</option>
                      <option value="USD">USD</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                    </select>
                  </div>
                  
                  {requestingItems[0].estimatedValue && (
                    <div className="mt-1 text-sm text-gray-500">
                      约合 
                      {requestingItems[0].currency !== 'CNY' 
                        ? ` ${calculateEquivalent(requestingItems[0].estimatedValue, requestingItems[0].currency, 'CNY')} CNY` 
                        : ` ${calculateEquivalent(requestingItems[0].estimatedValue, requestingItems[0].currency, 'USD')} USD`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#A2B5BB] hover:bg-[#8FA3A9] disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner size={20} />
                <span className="ml-2">创建中...</span>
              </div>
            ) : '创建订单'}
          </button>

          {shareLink && (
            <div className="mt-4 p-5 bg-[#F8F5F2] rounded-lg border border-[#E8DCD5]">
              <p className="text-lg font-medium text-gray-800 mb-3">订单创建成功！</p>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">订单链接</label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-base" 
                      value={shareLink} 
                      readOnly 
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(shareLink)
                          showSuccess('链接已复制到剪贴板')
                        } catch {
                          showError(new Error('复制失败，请手动复制'), '操作失败')
                        }
                      }}
                      className="px-4 py-2 bg-[#A2B5BB] text-white rounded hover:bg-[#8FA3A9] whitespace-nowrap"
                    >
                      复制链接
                    </button>
                  </div>
                  {shareExpiry && (
                    <p className="mt-1 text-sm text-gray-500">链接有效期至: {shareExpiry}</p>
                  )}
                  {isPrivate && (
                    <p className="mt-1 text-sm text-red-500 font-medium">
                      注意：这是私密订单，必须使用包含访问令牌的完整链接才能访问！
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  <Link
                    href={shareToken && typeof shareToken === 'string' && shareToken !== 'undefined' 
                      ? `/orders/${createdOrderId}?t=${shareToken}` 
                      : `/orders/${createdOrderId}`}
                    className="px-5 py-2 bg-[#A2B5BB] text-white rounded-lg hover:bg-[#8FA3A9] text-base"
                  >
                    查看订单详情
                  </Link>
                  <Link
                    href="/orders/my-orders" 
                    className="px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 text-base"
                  >
                    查看我的订单
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      // 重置表单，创建新订单
                      setTitle('')
                      setDescription('')
                      setOfferingItems([{ name: '', quantity: 1, currency: 'ETH', estimatedValue: '', category: 'cryptocurrency' }])
                      setRequestingItems([{ name: '', quantity: 1, currency: 'CNY', estimatedValue: '', category: 'cash' }])
                      setShareLink(null)
                      setShareToken(null)
                      setCreatedOrderId(null)
                      setSuccessMessage(null)
                    }}
                    className="px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 text-base"
                  >
                    创建另一个订单
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* 通知组件 */}
      <NotificationDisplay />
    </div>
  )
}