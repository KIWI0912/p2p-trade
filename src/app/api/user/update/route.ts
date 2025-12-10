import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/users'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const session = await getSession(request.cookies)
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: '未登录或会话已过期' },
        { status: 401 }
      )
    }
    
    // 解析请求体
    const body = await request.json()
    const { name } = body
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: '用户名不能为空' },
        { status: 400 }
      )
    }
    
    // 更新用户信息
    const user = await updateUser(session.userId, { name: name.trim() })
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        address: user.walletAddress
      }
    })
  } catch (error: any) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { error: error.message || '更新用户信息失败' },
      { status: 500 }
    )
  }
}