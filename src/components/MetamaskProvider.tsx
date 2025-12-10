// src/components/MetamaskProvider.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useNotification } from './ErrorHandler';
import AsyncStorage from '@/lib/AsyncStorageAdapter';
import { isWalletInitialized } from '@/lib/walletInit';

// 全局定义，确保 MetaMask SDK 可以使用我们的适配器
// 使用立即执行函数来确保这段代码只执行一次
(() => {
  // 检查是否已经设置过全局变量
  if (typeof window !== 'undefined' && !(window as any).__metamaskAdapterInitialized) {
    // 在全局范围内定义 AsyncStorage，以便 MetaMask SDK 可以找到它
    (window as any).AsyncStorage = AsyncStorage;
    
    // 防止 MetaMask SDK 初始化错误
    (window as any).ReactNativeWebView = {
      postMessage: () => {}
    };
    
    // 标记为已初始化
    (window as any).__metamaskAdapterInitialized = true;
  }
})();

export function MetamaskProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { showError } = useNotification();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 检查钱包是否已经初始化
    if (!isWalletInitialized()) {
      console.log('Wallet not initialized in MetamaskProvider');
    }
    
    setIsInitialized(true);
    
    return () => {
      // 清理代码，如果需要的话
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}