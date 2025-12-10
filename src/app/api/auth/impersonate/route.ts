// src/app/api/auth/impersonate/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// 处理模拟客户登录请求
export async function POST(req: Request) {
  try {
    // 获取当前会话，验证是否已登录
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 检查当前用户是否为管理员
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });
    
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: '权限不足，仅管理员可使用此功能' }, { status: 403 });
    }
    
    // 解析请求体获取客户钱包地址
    const { customerAddress } = await req.json();
    
    if (!customerAddress) {
      return NextResponse.json({ error: '缺少客户钱包地址' }, { status: 400 });
    }
    
    // 查找要模拟的客户
    const customer = await prisma.user.findFirst({
      where: { 
        address: { 
          equals: customerAddress, 
          mode: 'insensitive' 
        }
      }
    });
    
    if (!customer) {
      return NextResponse.json({ error: '未找到指定客户' }, { status: 404 });
    }
    
    // 创建模拟会话
    // 注意：这里应该使用适当的会话管理方式，这里仅作示例
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: customer.id,
        name: customer.name,
        address: customer.address,
        isImpersonating: true
      }
    });
    
  } catch (error: any) {
    console.error('模拟登录失败:', error);
    return NextResponse.json({ error: error.message || '模拟登录失败' }, { status: 500 });
  }
}