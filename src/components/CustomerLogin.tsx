// src/components/CustomerLogin.tsx
'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/components/ErrorHandler';
import { useRouter } from 'next/navigation';

interface CustomerLoginProps {
  onLogin?: () => void;
}

export function CustomerLogin({ onLogin }: CustomerLoginProps) {
  const { t } = useLanguage();
  const [customerAddress, setCustomerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  // 以客户身份登录
  const handleCustomerLogin = async () => {
    if (!customerAddress) {
      showError(new Error('请输入客户钱包地址'), '地址不能为空');
      return;
    }

    setLoading(true);
    try {
      // 调用API以客户身份登录
      const response = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerAddress }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '模拟登录失败');
      }

      showSuccess('已成功以客户身份登录');
      if (onLogin) onLogin();
      router.push('/order');
    } catch (error: any) {
      showError(error, '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">以客户身份登录</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">
            客户钱包地址
          </label>
          <Input
            id="customerAddress"
            type="text"
            placeholder="0x..."
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button
          variant="primary"
          loading={loading}
          onClick={handleCustomerLogin}
          className="w-full"
        >
          模拟客户登录
        </Button>
        
        <p className="text-xs text-gray-500 mt-2">
          注：此功能仅供管理员使用，用于以客户身份查看和操作订单
        </p>
      </div>
    </div>
  );
}