import { useState, useEffect } from 'react';
import { zh } from '@/lib/i18n';

/**
 * 错误处理 Hook
 * 提供统一的错误处理和友好的中文错误提示
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // 处理错误并转换为友好的中文提示
  const handleError = (err: any, customMessage = '') => {
    console.error('错误:', err);
    setError(err);
    setIsVisible(true);
    
    // 根据错误类型设置友好的中文错误信息
    if (err?.message?.includes('user rejected')) {
      setMessage(zh.errors.userRejected);
    } else if (err?.message?.includes('insufficient funds')) {
      setMessage(zh.errors.insufficientFunds);
    } else if (err?.message?.includes('network')) {
      setMessage(zh.errors.network);
    } else if (err?.message?.includes('unauthorized') || err?.message?.includes('401')) {
      setMessage(zh.errors.unauthorized);
    } else if (err?.message?.includes('not found') || err?.message?.includes('404')) {
      setMessage(zh.errors.notFound);
    } else if (customMessage) {
      setMessage(customMessage);
    } else {
      setMessage(zh.errors.general);
    }
    
    // 5秒后自动清除错误
    setTimeout(() => {
      clearError();
    }, 5000);
  };
  
  // 清除错误
  const clearError = () => {
    setError(null);
    setMessage('');
    setIsVisible(false);
  };

  return {
    error,
    message,
    isVisible,
    handleError,
    clearError
  };
}

/**
 * 错误显示组件
 */
interface ErrorDisplayProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function ErrorDisplay({ message, isVisible, onClose }: ErrorDisplayProps) {
  if (!isVisible || !message) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          <span className="block sm:inline">{message}</span>
        </div>
        <button onClick={onClose} className="ml-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * 成功提示组件
 */
interface SuccessDisplayProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function SuccessDisplay({ message, isVisible, onClose }: SuccessDisplayProps) {
  if (!isVisible || !message) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="block sm:inline">{message}</span>
        </div>
        <button onClick={onClose} className="ml-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * 通知管理 Hook
 * 提供成功和错误通知的统一管理
 */
export function useNotification() {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSuccessVisible, setIsSuccessVisible] = useState<boolean>(false);
  const { error, message: errorMessage, isVisible: isErrorVisible, handleError, clearError } = useErrorHandler();

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setIsSuccessVisible(true);
    
    // 3秒后自动清除
    setTimeout(() => {
      clearSuccess();
    }, 3000);
  };
  
  const clearSuccess = () => {
    setSuccessMessage('');
    setIsSuccessVisible(false);
  };

  return {
    // 成功通知
    successMessage,
    isSuccessVisible,
    showSuccess,
    clearSuccess,
    
    // 错误通知
    errorMessage,
    isErrorVisible,
    showError: handleError,
    clearError,
    
    // 通知组件
    NotificationDisplay: () => (
      <>
        <SuccessDisplay 
          message={successMessage} 
          isVisible={isSuccessVisible} 
          onClose={clearSuccess} 
        />
        <ErrorDisplay 
          message={errorMessage} 
          isVisible={isErrorVisible} 
          onClose={clearError} 
        />
      </>
    )
  };
}