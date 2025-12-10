import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { zh } from '@/lib/i18n';
import { WalletConnect } from './WalletConnect';
import { FadeTransition, SlideTransition } from './ui/Animation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 移动端导航菜单
 * 在小屏幕设备上提供全屏导航菜单
 */
export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  
  // 判断当前路径是否激活
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  // 当路由变化时关闭菜单
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);
  
  // 阻止菜单打开时的页面滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <FadeTransition show={isOpen} className="lg:hidden">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      <SlideTransition
        show={isOpen}
        direction="right"
        className="fixed top-0 right-0 w-64 h-full bg-white z-50 shadow-lg overflow-y-auto"
      >
        <div className="p-4 border-b border-[#E8DCD5]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">P2P 交易</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <nav className="space-y-2">
            <Link
              href="/orders"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive('/orders') && !isActive('/orders/my-orders') && !isActive('/new')
                  ? 'bg-[#F0F4F0] text-[#8E9D8A] font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={onClose}
            >
              {zh.orders.allOrders}
            </Link>
            
            <Link
              href="/orders/my-orders"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive('/orders/my-orders')
                  ? 'bg-[#F0F4F0] text-[#8E9D8A] font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={onClose}
            >
              {zh.orders.myOrders}
            </Link>
            
            <Link
              href="/new"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive('/new')
                  ? 'bg-[#EFF2F5] text-[#A2B5BB] font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={onClose}
            >
              {zh.orders.create}
            </Link>
          </nav>
          
          <div className="mt-6 pt-6 border-t border-[#E8DCD5]">
            <div className="mb-4">
              <WalletConnect />
            </div>
          </div>
        </div>
      </SlideTransition>
    </FadeTransition>
  );
}

/**
 * 移动端导航按钮
 * 用于打开移动端导航菜单
 */
export function MobileNavButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
      onClick={onClick}
      aria-label="打开导航菜单"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}