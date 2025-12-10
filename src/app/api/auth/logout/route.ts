// src/app/api/auth/logout/route.ts
// POST /api/auth/logout
// 清除会话 cookie

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(process.env.IRON_COOKIE_NAME || 'p2p_session')

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Error in /api/auth/logout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
