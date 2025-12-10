import Link from 'next/link';

export default function LoginPrompt() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">需要登录</h2>
        <p className="text-gray-600 mb-6">
          您需要登录才能查看订单详情。请连接您的钱包进行登录。
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          登录
        </Link>
      </div>
    </div>
  );
}