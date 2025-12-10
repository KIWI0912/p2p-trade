// src/app/api/orders/getList/route.ts
// 为了兼容性，创建 getList 路由作为 list 的别名

import { NextRequest } from 'next/server'
import { GET as listHandler } from '../list/route'

export async function GET(request: NextRequest) {
  // 直接调用 list 路由的处理函数
  return listHandler(request)
}