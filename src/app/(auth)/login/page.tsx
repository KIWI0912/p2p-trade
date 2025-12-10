// src/app/(auth)/login/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGetNonce, useSignIn } from '@/lib/hooks'
import { SiweMessage } from 'siwe'
import { useAccount, useSignMessage, useConnect } from 'wagmi'
import { useLanguage } from '@/lib/i18n'
import { injected } from '@wagmi/connectors'

export default function LoginPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { signMessageAsync } = useSignMessage()
  const { t } = useLanguage()
  const { mutateAsync: getNonce } = useGetNonce()
  const { mutateAsync: signIn } = useSignIn()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 添加mounted状态，解决水合错误
  const [mounted, setMounted] = useState(false)
  
  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = () => {
    try {
      connect({ connector: injected() });
    } catch (err: any) {
      setError(err.message || '连接钱包失败');
    }
  };

  const handleSignIn = async () => {
    if (!address || !isConnected) {
      setError('请先连接钱包')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 获取 nonce
      const nonce = await getNonce(address)

      // 获取域名信息 - 修改为直接访问，避免水合错误
      const domain = window.location.host
      const origin = window.location.origin

      // 创建 SIWE 消息
      const message = new SiweMessage({
        domain,
        address,
        statement: 'Sign in to P2P Trade Platform',
        uri: origin,
        version: '1',
        chainId: 1,
        nonce,
        resources: [],
        issuedAt: new Date().toISOString()
      })

      // 签名消息
      const messageToSign = message.prepareMessage()
      const signature = await signMessageAsync({ message: messageToSign })

      // 验证签名并登录
      const user = await signIn({ message: messageToSign, signature })

      // 重定向到订单列表
      router.push('/orders')
    } catch (err: any) {
      console.error('Sign in error:', err)
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 如果组件尚未在客户端挂载，返回一个简单的加载界面
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">P2P 交易</h1>
          <p className="text-center text-gray-600 mb-8">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">P2P 交易</h1>
        <p className="text-center text-gray-600 mb-8">使用以太坊钱包登录</p>

        {/* 登录流程指南 */}
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">登录流程</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>点击下方<strong>连接钱包</strong>按钮</li>
            <li>在弹出的钱包中确认连接</li>
            <li>连接成功后，点击<strong>使用以太坊登录</strong>按钮</li>
            <li>在钱包中签名消息完成登录</li>
          </ol>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">第一步：连接您的钱包</p>
            <button
              onClick={handleConnect}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
            >
              连接钱包
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-slate-50 rounded">
              <p className="text-sm text-gray-600 mb-1">已连接的钱包</p>
              <p className="font-mono text-sm text-gray-800 break-all">{address}</p>
            </div>

            <p className="text-gray-600 mb-4">第二步：使用钱包签名登录</p>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200"
            >
              {loading ? '正在登录...' : '使用以太坊登录'}
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 text-xs mt-8">
          P2P 交易 — 点对点买卖任何物品
        </p>
      </div>
    </div>
  )
}