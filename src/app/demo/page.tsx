"use client"

import React from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { OrderCard } from '@/components/OrderCard'
import type { Order } from '@/lib/hooks'

const sampleOrders: Order[] = [
  {
    id: 101,
    title: 'Vintage Camera for Sale',
    description: 'A well-kept film camera, perfect for collectors.',
    status: 'PENDING',
    direction: 'SELL',
    creator: { id: 1, address: '0xAa...1111', name: 'Alice', email: null, createdAt: new Date().toISOString() },
    accepter: null,
    offeringItems: [{ id: 1, name: 'Film Camera', quantity: 1 }],
    requestingItems: [{ id: 2, name: 'Payment', quantity: 1 }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    title: 'Handmade Pottery',
    description: 'Set of 3 handmade bowls, microwave-safe.',
    status: 'ACCEPTED',
    direction: 'SELL',
    creator: { id: 2, address: '0xBb...2222', name: 'Bob', email: null, createdAt: new Date().toISOString() },
    accepter: { id: 3, address: '0xCc...3333', name: 'Carol', email: null, createdAt: new Date().toISOString() },
    offeringItems: [{ id: 3, name: 'Pottery Set', quantity: 1 }],
    requestingItems: [{ id: 4, name: 'Local Pickup', quantity: 1 }],
    createdAt: new Date().toISOString(),
  }
]

// 用于演示的模拟当前用户地址
const DEMO_USER_ADDRESS = '0xCc...3333';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <section className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">P2P 交易 — 任何物品，点对点安全交易</h1>
            <p className="text-gray-600 mb-6">一个轻量的去中心化市场，用户可以发布订单、在链上托管资金，并在交易完成后释放给对方。</p>

            <div className="flex gap-4">
              <Link href="/app(orders)/new" className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700">
                发布订单
              </Link>
              <Link href="/orders" className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-800 rounded-md shadow hover:shadow-md">
                浏览订单
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">为什么选择 P2P？</h3>
            <ul className="space-y-3 text-gray-700">
              <li>🔐 链上托管（Escrow），资金更安全</li>
              <li>🧭 去中心化的发布，任何人都可以上架物品</li>
              <li>⚡ 流程明确，交易清晰可见</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">精选订单</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sampleOrders.map((o) => (
              <OrderCard 
                key={o.id} 
                order={o} 
                currentUserAddress={DEMO_USER_ADDRESS} 
              />
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">快速演示</h3>
          <p className="text-gray-600 mb-4">在上方通过钱包连接，尝试发布订单并体验托管流程。订单详情页包含链上交易状态展示。</p>
          <div className="flex gap-3">
            <Link href="/demo" className="px-4 py-2 bg-gray-100 rounded">演示提示</Link>
          </div>
        </section>
      </main>
    </div>
  )
}