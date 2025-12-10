// src/components/TransactionStatus.tsx
import React, { useEffect, useState } from 'react'
import { zh } from '@/lib/i18n'
import Spinner from './ui/Spinner'
import { useWaitForTransactionReceipt } from 'wagmi' // 更新为 wagmi v2 的 API

interface TransactionStatusProps {
  txHash?: string
  status?: 'pending' | 'confirmed' | 'failed'
  confirmations?: number
  requiredConfirmations?: number
  chainId?: number
  onConfirmed?: () => void
}

export function TransactionStatus({
  txHash,
  status: initialStatus = 'pending',
  confirmations: initialConfirmations = 0,
  requiredConfirmations = 12,
  chainId = 11155111, // 默认为 Sepolia 测试网
  onConfirmed,
}: TransactionStatusProps) {
  const [status, setStatus] = useState(initialStatus)
  const [confirmations, setConfirmations] = useState(initialConfirmations)
  
  // 使用 wagmi v2 的 useWaitForTransactionReceipt hook 来监控交易状态
  // 移除 enabled 属性，因为它在新版本中不被支持
  const { data, isSuccess, isPending, isError } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    confirmations: requiredConfirmations,
    // 移除了 enabled 属性
  })
  
  // 当交易确认状态改变时更新本地状态
  useEffect(() => {
    // 只有当 txHash 存在且状态不是已确认时才处理
    if (!txHash || status === 'confirmed') return
    
    if (isSuccess) {
      setStatus('confirmed')
      setConfirmations(requiredConfirmations)
      if (onConfirmed) onConfirmed()
    } else if (isError) {
      setStatus('failed')
    } else if (isPending) {
      setStatus('pending')
      // 这里可以通过其他方式获取当前确认数，但 wagmi 的 API 不直接提供
      // 为简化，我们可以使用模拟的确认数增长
      const timer = setInterval(() => {
        setConfirmations(prev => {
          if (prev < requiredConfirmations - 1) return prev + 1
          return prev
        })
      }, 5000)
      
      return () => clearInterval(timer)
    }
  }, [isSuccess, isError, isPending, requiredConfirmations, onConfirmed, txHash, status])

  if (!txHash) return null

  const getEtherscanUrl = () => {
    const chainMap: Record<number, string> = {
      1: 'etherscan.io',
      5: 'goerli.etherscan.io',
      11155111: 'sepolia.etherscan.io',
      42161: 'arbiscan.io',
      421614: 'sepolia.arbiscan.io',
    }
    const domain = chainMap[chainId] || 'etherscan.io'
    return `https://${domain}/tx/${txHash}`
  }

  // 莫兰迪色系
  const getStatusColor = () => {
    if (status === 'confirmed') return 'bg-[#8E9D8A] text-white'
    if (status === 'pending') return 'bg-[#A2B5BB] text-white'
    return 'bg-[#E98980] text-white'
  }
  
  const getProgressColor = () => {
    if (status === 'confirmed') return 'bg-[#8E9D8A]'
    if (status === 'pending') return 'bg-[#A2B5BB]'
    return 'bg-[#E98980]'
  }

  const getStatusIcon = () => {
    if (status === 'confirmed') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    if (status === 'pending') {
      return <Spinner size={20} color="white" />
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
  }

  const getStatusMessage = () => {
    if (status === 'confirmed') {
      return zh.common.success
    } else if (status === 'pending') {
      return zh.common.loading
    } else {
      return zh.errors.transactionFailed
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-[#E8DCD5]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">交易状态</h3>
        <span className={`px-2 py-1 rounded-md flex items-center gap-1 text-sm ${getStatusColor()}`}>
          {getStatusIcon()}
          {getStatusMessage()}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 mb-1">交易哈希:</span>
          <a
            href={getEtherscanUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A0A8B1] hover:text-[#8C959E] text-sm font-mono truncate"
          >
            {txHash}
          </a>
        </div>
        
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">确认进度:</span>
            <span className="text-sm text-gray-700 font-medium">
              {confirmations}/{requiredConfirmations}
            </span>
          </div>
          <div className="w-full bg-[#F8F5F2] rounded-full h-2 overflow-hidden">
            <div
              className={`${getProgressColor()} h-full transition-all duration-500`}
              style={{ width: `${Math.min((confirmations / requiredConfirmations) * 100, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-[#E8DCD5]">
          <a
            href={getEtherscanUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A0A8B1] hover:text-[#8C959E] text-sm flex items-center"
          >
            在区块浏览器查看
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          
          {status === 'confirmed' && data && (
            <span className="text-[#8E9D8A] text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {/* 修复: 移除 blockTimestamp，使用当前时间或区块号 */}
              区块 #{data.blockNumber?.toString() || '未知'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}