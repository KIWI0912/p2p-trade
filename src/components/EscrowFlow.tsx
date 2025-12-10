import { useState, useEffect } from 'react';
import { useCreateEscrow, useFundEscrow, useAcceptEscrow, useCompleteEscrow, useGetEscrowStatus } from '@/lib/hooks';
import { Button } from '@/components/ui/Button';
import { zh } from '@/lib/i18n';
import { useNotification } from '@/components/ErrorHandler';
import { AssetType } from '@/lib/web3';
import { ethers } from 'ethers';

// 莫兰迪色系
const colors = {
  primary: 'bg-[#A0A8B1] hover:bg-[#8C959E] text-white',
  secondary: 'bg-[#D8C3A5] hover:bg-[#C8B393] text-gray-800',
  success: 'bg-[#8E9D8A] hover:bg-[#7A8976] text-white',
  danger: 'bg-[#E98980] hover:bg-[#D97970] text-white',
  info: 'bg-[#A2B5BB] hover:bg-[#8FA3A9] text-white',
  neutral: 'bg-[#E8DCD5] hover:bg-[#D8CCC5] text-gray-800',
};

interface EscrowFlowProps {
  orderId: number;
  accepterAddress: string;
  creatorAddress: string;
  currentUserAddress: string;
  escrowId?: number | null;
  escrowStatus?: string | null;
  escrowAddress?: string | null;
  escrowTxHash?: string | null;
  onEscrowUpdated?: () => void;
}

/**
 * 托管流程组件
 * 用于管理订单的托管过程，包括创建、存入资金、接受和完成托管
 */
export function EscrowFlow({
  orderId,
  accepterAddress,
  creatorAddress,
  currentUserAddress,
  escrowId,
  escrowStatus,
  escrowAddress,
  escrowTxHash,
  onEscrowUpdated
}: EscrowFlowProps) {
  // 获取托管状态
  const { data: latestEscrowStatus, refetch: refetchStatus } = useGetEscrowStatus(escrowId || 0, {
    enabled: !!escrowId
  });
  
  // 托管操作 hooks
  const { mutateAsync: createEscrow, isPending: isCreating } = useCreateEscrow();
  const { mutateAsync: fundEscrow, isPending: isFunding } = useFundEscrow();
  const { mutateAsync: acceptEscrow, isPending: isAccepting } = useAcceptEscrow();
  const { mutateAsync: completeEscrow, isPending: isCompleting } = useCompleteEscrow();
  
  // 通知系统
  const { showSuccess, showError, NotificationDisplay } = useNotification();
  
  // 当前步骤
  const [step, setStep] = useState<'create' | 'fund' | 'accept' | 'complete' | 'done'>(() => {
    if (!escrowId) return 'create';
    if (escrowStatus === 'PENDING') return 'fund';
    if (escrowStatus === 'FUNDED') return 'accept';
    if (escrowStatus === 'ACCEPTED') return 'complete';
    if (escrowStatus === 'COMPLETED' || escrowStatus === 'CANCELLED') return 'done';
    return 'create';
  });
  
  // 托管金额 (ETH)
  const [amount, setAmount] = useState<string>('0.01');
  
  // 当托管状态更新时更新步骤
  useEffect(() => {
    if (latestEscrowStatus) {
      if (latestEscrowStatus === 'PENDING') setStep('fund');
      else if (latestEscrowStatus === 'FUNDED') setStep('accept');
      else if (latestEscrowStatus === 'ACCEPTED') setStep('complete');
      else if (latestEscrowStatus === 'COMPLETED' || latestEscrowStatus === 'CANCELLED') setStep('done');
    }
  }, [latestEscrowStatus]);
  
  // 判断当前用户是否是创建者
  const isCreator = currentUserAddress.toLowerCase() === creatorAddress.toLowerCase();
  // 判断当前用户是否是接受者
  const isAccepter = currentUserAddress.toLowerCase() === accepterAddress.toLowerCase();
  
  // 处理创建托管
  const handleCreateEscrow = async () => {
    try {
      await createEscrow({
        orderId,
        accepter: accepterAddress,
        assetType: AssetType.ETH,
        tokenAddress: '0x0000000000000000000000000000000000000000',
        amount: ethers.parseEther(amount).toString()
      });
      
      showSuccess(zh.escrow.messages.createSuccess);
      setStep('fund');
      
      // 通知父组件托管已更新
      if (onEscrowUpdated) onEscrowUpdated();
    } catch (error) {
      showError(error, zh.errors.contractError);
    }
  };
  
  // 处理存入资金
  const handleFundEscrow = async () => {
    if (!escrowId) {
      showError(new Error('托管ID不存在'), '找不到托管ID');
      return;
    }
    
    try {
      await fundEscrow({
        escrowId,
        amount: ethers.parseEther(amount).toString()
      });
      
      showSuccess(zh.escrow.messages.fundSuccess);
      setStep('accept');
      
      // 通知父组件托管已更新
      if (onEscrowUpdated) onEscrowUpdated();
    } catch (error) {
      showError(error, zh.errors.contractError);
    }
  };
  
  // 处理接受托管
  const handleAcceptEscrow = async () => {
    if (!escrowId) {
      showError(new Error('托管ID不存在'), '找不到托管ID');
      return;
    }
    
    try {
      await acceptEscrow({ escrowId });
      
      showSuccess(zh.escrow.messages.acceptSuccess);
      setStep('complete');
      
      // 通知父组件托管已更新
      if (onEscrowUpdated) onEscrowUpdated();
    } catch (error) {
      showError(error, zh.errors.contractError);
    }
  };
  
  // 处理完成托管
  const handleCompleteEscrow = async () => {
    if (!escrowId) {
      showError(new Error('托管ID不存在'), '找不到托管ID');
      return;
    }
    
    try {
      await completeEscrow({ escrowId });
      
      showSuccess(zh.escrow.messages.completeSuccess);
      setStep('done');
      
      // 通知父组件托管已更新
      if (onEscrowUpdated) onEscrowUpdated();
    } catch (error) {
      showError(error, zh.errors.contractError);
    }
  };
  
  // 渲染托管状态标签
  const renderStatusBadge = () => {
    const status = latestEscrowStatus || escrowStatus;
    if (!status) return null;
    
    let bgColor = '';
    switch (status) {
      case 'PENDING':
        bgColor = 'bg-[#E8DCD5] text-gray-800';
        break;
      case 'FUNDED':
        bgColor = 'bg-[#A2B5BB] text-white';
        break;
      case 'ACCEPTED':
        bgColor = 'bg-[#8E9D8A] text-white';
        break;
      case 'COMPLETED':
        bgColor = 'bg-[#8C959E] text-white';
        break;
      case 'CANCELLED':
        bgColor = 'bg-[#E98980] text-white';
        break;
      case 'DISPUTED':
        bgColor = 'bg-[#D8C3A5] text-gray-800';
        break;
      default:
        bgColor = 'bg-gray-200 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-md ${bgColor}`}>
        {zh.escrow.status[status as keyof typeof zh.escrow.status] || status}
      </span>
    );
  };
  
  // 渲染步骤指示器
  const renderStepIndicator = () => {
    const steps = [
      { key: 'create', label: zh.escrow.flow.step1 },
      { key: 'fund', label: zh.escrow.flow.step2 },
      { key: 'accept', label: zh.escrow.flow.step3 },
      { key: 'complete', label: zh.escrow.flow.step4 }
    ];
    
    const currentStepIndex = steps.findIndex(s => s.key === step);
    
    return (
      <div className="flex items-center justify-between w-full mb-6">
        {steps.map((s, index) => (
          <div key={s.key} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index <= currentStepIndex ? 'bg-[#8E9D8A] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {index + 1}
            </div>
            <span className="text-xs mt-1">{s.label}</span>
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-16 mx-2 ${
                index < currentStepIndex ? 'bg-[#8E9D8A]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染托管详情
  const renderEscrowDetails = () => {
    if (!escrowId) return null;
    
    return (
      <div className="mt-4 p-4 bg-[#F8F5F2] rounded-md border border-[#E8DCD5]">
        <h4 className="font-medium text-gray-700 mb-2">{zh.escrow.title}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-600">{zh.escrow.escrowId}:</div>
          <div>{escrowId}</div>
          
          <div className="text-gray-600">状态:</div>
          <div>{renderStatusBadge()}</div>
          
          {escrowAddress && (
            <>
              <div className="text-gray-600">{zh.escrow.contractAddress}:</div>
              <div className="truncate">{escrowAddress}</div>
            </>
          )}
          
          {escrowTxHash && (
            <>
              <div className="text-gray-600">{zh.escrow.txHash}:</div>
              <div className="truncate">
                <a 
                  href={`https://sepolia.etherscan.io/tx/${escrowTxHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#8C959E] hover:underline"
                >
                  {escrowTxHash.substring(0, 10)}...
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="escrow-flow border border-[#E8DCD5] rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{zh.escrow.flow.title}</h3>
      
      {/* 步骤指示器 */}
      {renderStepIndicator()}
      
      {/* 托管详情 */}
      {renderEscrowDetails()}
      
      {/* 创建托管步骤 */}
      {step === 'create' && isCreator && (
        <div className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {zh.escrow.amount} (ETH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A0A8B1]"
              step="0.001"
              min="0.001"
            />
          </div>
          <Button
            onClick={handleCreateEscrow}
            className={`w-full ${colors.primary}`}
            loading={isCreating}
          >
            {zh.escrow.create}
          </Button>
        </div>
      )}
      
      {/* 存入资金步骤 */}
      {step === 'fund' && isCreator && (
        <div className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {zh.escrow.amount} (ETH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#A0A8B1]"
              step="0.001"
              min="0.001"
              disabled
            />
          </div>
          <Button
            onClick={handleFundEscrow}
            className={`w-full ${colors.primary}`}
            loading={isFunding}
          >
            {zh.escrow.fund}
          </Button>
        </div>
      )}
      
      {/* 接受托管步骤 */}
      {step === 'accept' && (
        <div className="mt-4">
          {isAccepter ? (
            <Button
              onClick={handleAcceptEscrow}
              className={`w-full ${colors.success}`}
              loading={isAccepting}
            >
              {zh.escrow.accept}
            </Button>
          ) : (
            <div className="text-center py-2 text-gray-600">
              {zh.escrow.flow.waitingAccept}
            </div>
          )}
        </div>
      )}
      
      {/* 完成托管步骤 */}
      {step === 'complete' && (
        <div className="mt-4">
          {isCreator || isAccepter ? (
            <Button
              onClick={handleCompleteEscrow}
              className={`w-full ${colors.success}`}
              loading={isCompleting}
            >
              {zh.escrow.complete}
            </Button>
          ) : (
            <div className="text-center py-2 text-gray-600">
              {zh.escrow.flow.waitingComplete}
            </div>
          )}
        </div>
      )}
      
      {/* 已完成状态 */}
      {step === 'done' && (
        <div className="mt-4 text-center py-2 text-[#8E9D8A] font-medium">
          {latestEscrowStatus === 'COMPLETED' ? zh.escrow.messages.completeSuccess : zh.escrow.messages.cancelSuccess}
        </div>
      )}
      
      {/* 通知组件 */}
      <NotificationDisplay />
    </div>
  );
}