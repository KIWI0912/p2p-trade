'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { Button } from './ui/Button'
import { useLanguage } from '@/lib/i18n'
import { useGetMe, useGetNonce, useSignIn, useLogout } from '@/lib/hooks'
import { SiweMessage } from 'siwe'
import { useRouter } from 'next/navigation'

// 会话有效期（分钟）
const SESSION_TIMEOUT_MINUTES = 5;
// 不活动超时时间（分钟）
const INACTIVITY_TIMEOUT_MINUTES = 10;
// 页面不可见超时时间（分钟）
const VISIBILITY_TIMEOUT_MINUTES = 3;
// 用户名提示冷却时间（分钟）
const USERNAME_PROMPT_COOLDOWN_MINUTES = 60;

export function AuthConnect() {
  const router = useRouter()
  const { t } = useLanguage()
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  
  // API hooks
  const { data: user, refetch: refetchUser, isLoading: isLoadingUser } = useGetMe()
  const { mutateAsync: getNonce } = useGetNonce()
  const { mutateAsync: signIn, isPending: isSigningIn } = useSignIn()
  const { mutateAsync: logout } = useLogout()
  
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [autoAuthAttempted, setAutoAuthAttempted] = useState(false)
  const [lastActivity, setLastActivity] = useState<Date>(new Date())
  const [pageVisible, setPageVisible] = useState(true)
  const [pageHiddenTime, setPageHiddenTime] = useState<Date | null>(null)
  const [shouldRedirectToSettings, setShouldRedirectToSettings] = useState(false)

  // 用户活动监听器
  const updateLastActivity = () => {
    setLastActivity(new Date());
  };

  // 页面可见性变化监听器
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setPageVisible(false);
      setPageHiddenTime(new Date());
    } else {
      setPageVisible(true);
      // 如果页面重新变为可见，检查是否超过了不可见超时时间
      if (pageHiddenTime) {
        const hiddenDuration = (new Date().getTime() - pageHiddenTime.getTime()) / (1000 * 60);
        if (hiddenDuration > VISIBILITY_TIMEOUT_MINUTES && user) {
          console.log(`Page was hidden for ${hiddenDuration.toFixed(2)} minutes, logging out for security`);
          handleLogout();
        }
      }
      setPageHiddenTime(null);
    }
  };

  // 只在客户端渲染，避免水合不匹配
  useEffect(() => {
    setMounted(true);
    
    // 添加用户活动监听器
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity);
    });
    
    // 添加页面可见性变化监听器
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // 清理事件监听器
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 定期检查用户不活动状态
  useEffect(() => {
    if (!user) return; // 如果用户未登录，不需要检查
    
    const checkInactivity = setInterval(() => {
      const now = new Date();
      const inactiveTime = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      if (inactiveTime > INACTIVITY_TIMEOUT_MINUTES) {
        console.log(`User inactive for ${inactiveTime.toFixed(2)} minutes, logging out for security`);
        handleLogout();
        clearInterval(checkInactivity);
      }
    }, 60000); // 每分钟检查一次
    
    return () => clearInterval(checkInactivity);
  }, [user, lastActivity]);

  // 检查用户是否需要设置用户名 - 改进逻辑，避免频繁跳转
  useEffect(() => {
    // 如果用户已登录但没有用户名，且尚未设置重定向标志
    if (user && (!user.name || user.name.trim() === '') && !shouldRedirectToSettings) {
      // 检查是否已经在设置页面，避免循环重定向
      if (!window.location.pathname.includes('/user/settings')) {
        // 检查上次提示时间
        const lastPromptTime = localStorage.getItem('username_prompt_time');
        const now = new Date().getTime();
        
        // 如果从未提示过，或者上次提示已经超过冷却时间
        if (!lastPromptTime || (now - parseInt(lastPromptTime)) > USERNAME_PROMPT_COOLDOWN_MINUTES * 60 * 1000) {
          setShouldRedirectToSettings(true);
          console.log('User has no username, redirecting to settings page');
          
          // 更新提示时间
          localStorage.setItem('username_prompt_time', now.toString());
          
          // 使用setTimeout确保状态更新后再重定向
          setTimeout(() => {
            router.push('/user/settings');
          }, 300);
        } else {
          console.log('Username prompt cooldown active, skipping redirect');
        }
      }
    }
    
    // 如果用户已设置用户名，清除提示标记
    if (user && user.name && user.name.trim() !== '') {
      localStorage.removeItem('username_prompt_time');
    }
  }, [user, router, shouldRedirectToSettings]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    if (!isOpen) return
    
    const handleClickOutside = () => setIsOpen(false)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  // 当钱包连接状态改变时，检查用户认证状态
  useEffect(() => {
    const attemptAutoAuth = async () => {
      // 只在钱包已连接但用户未登录，且尚未尝试过自动认证时执行
      if (isConnected && address && !user && !isLoadingUser && !autoAuthAttempted && !isAuthenticating) {
        console.log('Wallet connected, attempting automatic authentication');
        setAutoAuthAttempted(true);
        
        try {
          // 检查localStorage中是否有认证信息
          const authTimestamp = localStorage.getItem('auth_timestamp');
          const lastAddress = localStorage.getItem('auth_address');
          
          // 如果有认证信息，且地址匹配，且时间在设定的会话有效期内，尝试自动认证
          if (authTimestamp && lastAddress && lastAddress.toLowerCase() === address.toLowerCase()) {
            const lastAuth = new Date(authTimestamp).getTime();
            const now = new Date().getTime();
            const minutesDiff = (now - lastAuth) / (1000 * 60);
            
            if (minutesDiff < SESSION_TIMEOUT_MINUTES) {
              console.log('Recent authentication found, attempting to refresh session');
              await refetchUser();
              
              // 如果刷新后仍未登录，尝试自动认证
              if (!user) {
                await handleAuthenticate(true);
              }
            } else {
              console.log(`Authentication expired (${minutesDiff.toFixed(2)} minutes old), manual authentication required`);
              // 清除过期的认证信息
              localStorage.removeItem('auth_timestamp');
              localStorage.removeItem('auth_address');
            }
          }
        } catch (error) {
          console.error('Auto-authentication failed:', error);
        }
      }
    };
    
    attemptAutoAuth();
  }, [isConnected, address, user, isLoadingUser, autoAuthAttempted, isAuthenticating]);

  // 处理用户认证（使用标准 SIWE 格式）
  const handleAuthenticate = async (silent = false) => {
    if (!address) {
      console.error('No wallet address available')
      return
    }
    
    try {
      setIsAuthenticating(true)
      setConnectionError(null)
      console.log('Starting authentication for address:', address)
      
      // 1. 获取 nonce
      console.log('Getting nonce...')
      const nonce = await getNonce(address)
      console.log('Received nonce:', nonce)
      
      // 2. 创建标准SIWE消息
      const domain = window.location.host
      const origin = window.location.origin
      const currentChainId = chain?.id || 1
      const timestamp = new Date().toISOString()
      
      // 使用标准EIP-4361格式创建消息
      const messageToSign = 
`${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to P2P Trading Platform

URI: ${origin}
Version: 1
Chain ID: ${currentChainId}
Nonce: ${nonce}
Issued At: ${timestamp}`

      console.log('Message to sign:', messageToSign)
      
      // 3. 签名消息
      console.log('Requesting signature...')
      const signature = await signMessageAsync({
        message: messageToSign,
      })
      console.log('Signature received:', signature)
      
      // 4. 提交签名进行验证
      console.log('Submitting for verification...')
      await signIn({
        message: messageToSign,
        signature: signature,
      })
      
      // 5. 刷新用户数据
      console.log('Refreshing user data...')
      await refetchUser()
      
      // 6. 保存认证信息到localStorage，用于自动认证
      localStorage.setItem('auth_timestamp', new Date().toISOString());
      localStorage.setItem('auth_address', address);
      
      // 7. 重置用户活动时间
      updateLastActivity();
      
      console.log('Authentication successful!')
      
      // 8. 检查用户是否有用户名，如果没有，设置标志以便重定向到设置页面
      const userData = await refetchUser();
      if (userData?.data && (!userData.data.name || userData.data.name.trim() === '')) {
        // 检查上次提示时间
        const lastPromptTime = localStorage.getItem('username_prompt_time');
        const now = new Date().getTime();
        
        // 如果从未提示过，或者上次提示已经超过冷却时间
        if (!lastPromptTime || (now - parseInt(lastPromptTime)) > USERNAME_PROMPT_COOLDOWN_MINUTES * 60 * 1000) {
          setShouldRedirectToSettings(true);
          // 更新提示时间
          localStorage.setItem('username_prompt_time', now.toString());
          // 使用setTimeout确保状态更新后再重定向
          setTimeout(() => {
            router.push('/user/settings');
          }, 300);
        }
      }
      
    } catch (error) {
      console.error('Authentication failed:', error)
      // 显示更友好的错误信息
      if (!silent && error instanceof Error) {
        if (error.message.includes('User rejected')) {
          console.log('User rejected the signature request')
          setConnectionError('用户拒绝了签名请求')
        } else {
          console.error('Authentication error details:', error.message)
          setConnectionError('认证失败，请重试')
        }
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout()
      await refetchUser()
      // 清除localStorage中的认证信息
      localStorage.removeItem('auth_timestamp');
      localStorage.removeItem('auth_address');
      // 不要在这里调用disconnect，让用户保持钱包连接状态
      console.log('User logged out');
      // 重置重定向标志
      setShouldRedirectToSettings(false);
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // 处理断开连接 - 修改后的函数
  const handleDisconnect = async () => {
    try {
      await handleLogout()
      
      // 使用setTimeout确保登出操作完成后再断开连接
      setTimeout(() => {
        disconnect()
        setIsOpen(false)
        setAutoAuthAttempted(false) // 重置自动认证状态
        
        console.log('Wallet disconnected')
      }, 300)
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  // 在页面卸载/关闭前尝试登出
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 注意：这里不能使用异步函数，因为beforeunload事件不会等待异步操作完成
      // 所以我们只清除localStorage中的认证信息
      if (user) {
        localStorage.removeItem('auth_timestamp');
        localStorage.removeItem('auth_address');
        console.log('Cleared auth data on page unload');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  if (!mounted) {
    return <div className="w-20 h-10 bg-[#F8F5F2] rounded animate-pulse" />
  }

  // 用户已认证状态
  if (isConnected && address && user) {
    return (
      <div className="relative">
        <button 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F0F4F0] hover:bg-[#E0E8E0] transition"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
            updateLastActivity(); // 更新用户活动时间
          }}
        >
          <div className="h-2 w-2 rounded-full bg-[#8E9D8A]"></div>
          <div className="text-sm font-medium text-gray-700">
            {user.name || `${address.slice(0, 6)}...${address.slice(-4)}`}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E8DCD5] z-10">
            <div className="p-3 border-b border-[#E8DCD5]">
              <p className="text-xs text-gray-500">{t.wallet.address}</p>
              <p className="text-sm font-mono text-gray-700 truncate">{address}</p>
              {user.name && (
                <>
                  <p className="text-xs text-gray-500 mt-2">{t.auth.username}</p>
                  <p className="text-sm text-gray-700">{user.name}</p>
                </>
              )}
            </div>
            <div className="p-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(address)
                  setIsOpen(false)
                  updateLastActivity(); // 更新用户活动时间
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#F8F5F2] rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                {t.wallet.copy}
              </button>
              <button 
                onClick={() => {
                  router.push('/user/settings');
                  setIsOpen(false);
                  updateLastActivity(); // 更新用户活动时间
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#F8F5F2] rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                设置
              </button>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                  updateLastActivity(); // 更新用户活动时间
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#F8F5F2] rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t.auth.logout}
              </button>
              <button 
                onClick={() => {
                  handleDisconnect();
                  updateLastActivity(); // 更新用户活动时间
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#E98980] hover:bg-[#F8F5F2] rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t.auth.disconnect || '断开钱包'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 钱包已连接但用户未认证
  if (isConnected && address && !user) {
    return (
      <div>
        <Button
          variant="info"
          size="sm"
          loading={isAuthenticating || isSigningIn || isLoadingUser}
          onClick={() => {
            handleAuthenticate(false);
            updateLastActivity(); // 更新用户活动时间
          }}
          className="flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isAuthenticating || isSigningIn || isLoadingUser ? t.auth.authenticating : t.auth.authenticate}
        </Button>
        {connectionError && (
          <p className="text-xs text-red-500 mt-1">{connectionError}</p>
        )}
      </div>
    )
  }

  // 钱包未连接
  const uniqueByName = (() => {
    const map = new Map<string, typeof connectors[0]>()
    for (const c of connectors) {
      const name = c.name || c.id
      if (!map.has(name)) map.set(name, c)
    }
    const arr = Array.from(map.values())
    // 把 MetaMask 放前面（如果存在）
    arr.sort((a, b) => {
      const aMeta = (a.name || '').toLowerCase().includes('meta') ? -1 : 0
      const bMeta = (b.name || '').toLowerCase().includes('meta') ? -1 : 0
      return aMeta - bMeta
    })
    return arr
  })()

  return (
    <div className="relative">
      <Button
        variant="primary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
          updateLastActivity(); // 更新用户活动时间
        }}
        className="flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {t.wallet.connect}
      </Button>
      
      {isOpen && uniqueByName.length > 0 && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E8DCD5] z-10">
          <div className="p-2 space-y-1">
            {uniqueByName.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  try {
                    connect({ connector })
                    setIsOpen(false)
                    setConnectionError(null)
                    setAutoAuthAttempted(false) // 重置自动认证状态，以便连接后尝试自动认证
                    updateLastActivity(); // 更新用户活动时间
                  } catch (error) {
                    console.error('Connection error:', error)
                    setConnectionError('连接钱包失败，请重试')
                  }
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#F8F5F2] rounded flex items-center"
              >
                {connector.name === 'MetaMask' && (
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32.9582 1L19.8241 10.7183L22.2665 5.09986L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.65601 1L15.6752 10.8234L13.3502 5.09986L2.65601 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M28.2443 23.6367L24.7532 28.9655L32.2871 31.0113L34.4299 23.7418L28.2443 23.6367Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1.19043 23.7418L3.32226 31.0113L10.8471 28.9655L7.36499 23.6367L1.19043 23.7418Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {connector.name}
              </button>
            ))}
          </div>
          {connectionError && (
            <p className="text-xs text-red-500 p-2 border-t border-[#E8DCD5]">{connectionError}</p>
          )}
        </div>
      )}
    </div>
  )
}