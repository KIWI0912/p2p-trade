"use client"

import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error | null }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console for now — could be sent to external monitoring
    // eslint-disable-next-line no-console
    console.error('Unhandled error caught by ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white border border-red-200 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-red-700 mb-2">出错了</h2>
            <p className="text-sm text-gray-700 mb-4">应用出现未处理的运行时错误。你可以尝试刷新页面或联系开发者。</p>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </button>
              <button
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                返回首页
              </button>
            </div>
            <details className="mt-4 text-xs text-gray-500">
              <summary>错误详情</summary>
              <pre className="whitespace-pre-wrap break-words mt-2">{String(this.state.error)}</pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
