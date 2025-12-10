'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'

// 用户数据类型
interface User {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  completedOrders: number;
  rating: number;
  verificationLevel: 'basic' | 'verified' | 'trusted';
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 模拟获取用户数据
  useEffect(() => {
    console.log('fetching user data for id:', params.id);
    
    // 在真实环境中应该从API获取
    setTimeout(() => {
      // 模拟数据
      setUser({
        id: params.id,
        name: `用户${params.id}`,
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        bio: '区块链爱好者，喜欢交易各种物品和数字资产。',
        joinedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
        completedOrders: Math.floor(Math.random() * 50),
        rating: 4 + Math.random(),
        verificationLevel: Math.random() > 0.7 ? 'trusted' : (Math.random() > 0.4 ? 'verified' : 'basic')
      });
      setLoading(false);
    }, 800);
  }, [params.id]);

  // 评级显示辅助函数
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <Spinner size={32} />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center text-gray-500">未找到用户</div>
      </div>
    )
  }

  // 验证等级标签
  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'trusted':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">受信任用户</span>
      case 'verified':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">已验证用户</span>
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">基础用户</span>
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-[#8C959E] hover:text-[#6A757E] flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 用户基本信息 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center text-center mb-4">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="w-24 h-24 rounded-full mb-4"
                />
                <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
                <p className="text-xs font-mono text-gray-500 mt-1 truncate w-full">{user.address}</p>
                <div className="mt-2">
                  {getVerificationBadge(user.verificationLevel)}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">加入日期:</span>
                  <span className="text-sm text-gray-800">{new Date(user.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">已完成订单:</span>
                  <span className="text-sm text-gray-800">{user.completedOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">评分:</span>
                  <span className="text-sm text-gray-800">
                    {user.rating.toFixed(1)} / 5.0
                    <span className="text-yellow-500 ml-1">{renderStars(user.rating)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 用户详细信息 */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">关于用户</h2>
              <p className="text-gray-600">{user.bio || '该用户暂未添加个人简介'}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">信任因素</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#8E9D8A] flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">已验证用户</p>
                    <p className="text-sm text-gray-500">该用户已通过身份验证流程</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#A2B5BB] flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">成功交易</p>
                    <p className="text-sm text-gray-500">
                      已成功完成 {user.completedOrders} 笔交易
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#D8C3A5] flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">良好评价</p>
                    <p className="text-sm text-gray-500">
                      获得 {user.rating.toFixed(1)}/5 的用户评分
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}