'use client'

import { useGetMe } from '@/lib/hooks'
import { useAccount } from 'wagmi'
import { AuthConnect } from './AuthConnect'

interface AuthRequiredProps {
  children: React.ReactNode
  message?: string
}

export function AuthRequired({ children, message = '请先连接钱包并完成认证以访问此功能' }: AuthRequiredProps) {
  const { isConnected } = useAccount()
  const { data: userData, isLoading } = useGetMe()
  const user = userData?.user

  // 如果正在加载用户数据，显示加载状态
  if (isLoading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">正在加载用户数据...</p>
      </div>
    )
  }

  // 如果用户已认证，显示子组件
  if (isConnected && user) {
    return <>{children}</>
  }

  // 如果用户已连接钱包但未认证
  if (isConnected && !user) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-lg mb-2">需要认证</h3>
            <p>您已连接钱包，但需要完成认证才能继续。</p>
          </div>
          <div className="mb-4">
            <AuthConnect />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            认证过程需要您使用钱包签名一条消息，这不会产生任何gas费用。
          </p>
        </div>
      </div>
    )
  }

  // 如果用户未连接钱包
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-lg mb-2">需要连接钱包</h3>
          <p>{message}</p>
        </div>
        <div className="mb-4">
          <AuthConnect />
        </div>
        <p className="text-sm text-gray-500 mt-4">
          连接钱包并完成认证后，您将能够查看和创建订单。
        </p>
      </div>
    </div>
  )
}