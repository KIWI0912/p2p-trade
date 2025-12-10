// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title P2PEscrow
 * @dev 点对点交易托管合约，支持 ETH 和 ERC20 代币
 * 
 * 功能:
 * - 创建者存入资产到托管
 * - 接受者确认交易
 * - 交易完成，释放资产给接受者
 * - 支持争议解决机制
 */
contract P2PEscrow is ReentrancyGuard, Ownable {
    
    // ============ 类型定义 ============
    
    enum EscrowStatus {
        PENDING,      // 等待存入
        FUNDED,       // 已存入，等待接受者确认
        ACCEPTED,     // 已接受，等待完成
        COMPLETED,    // 已完成，资产已释放
        CANCELLED,    // 已取消
        DISPUTED      // 有争议
    }
    
    enum AssetType {
        ETH,
        ERC20
    }
    
    struct Escrow {
        uint256 escrowId;
        uint256 orderId;           // 关联的订单 ID
        address creator;           // 创建者 (出方)
        address accepter;          // 接受者 (入方，可能初始为 0)
        AssetType assetType;       // 资产类型
        address tokenAddress;      // ERC20 代币地址 (ETH 时为 0)
        uint256 amount;            // 金额
        EscrowStatus status;       // 状态
        uint256 createdAt;         // 创建时间
        uint256 fundedAt;          // 存入时间
        uint256 completedAt;       // 完成时间
    }
    
    struct Dispute {
        uint256 disputeId;
        uint256 escrowId;
        address initiator;         // 发起者
        string reason;             // 争议原因
        uint256 createdAt;
        bool resolved;
        address winner;            // 胜者 (解决后确定)
    }
    
    // ============ 状态变量 ============
    
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Dispute) public disputes;
    
    uint256 public escrowCounter;
    uint256 public disputeCounter;
    
    uint256 public disputeResolutionPeriod = 7 days;  // 争议解决期限
    uint256 public platformFeePercent = 1;             // 平台手续费百分比
    address public feeRecipient;                        // 手续费接收地址
    
    // ============ 事件 ============
    
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed orderId,
        address indexed creator,
        uint256 amount,
        AssetType assetType
    );
    
    event EscrowFunded(
        uint256 indexed escrowId,
        address indexed creator,
        uint256 amount
    );
    
    event EscrowAccepted(
        uint256 indexed escrowId,
        address indexed accepter
    );
    
    event EscrowCompleted(
        uint256 indexed escrowId,
        address indexed accepter,
        uint256 amount
    );
    
    event EscrowCancelled(
        uint256 indexed escrowId,
        address indexed creator
    );
    
    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed escrowId,
        address indexed initiator,
        string reason
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        uint256 indexed escrowId,
        address indexed winner
    );
    
    event FeeWithdrawn(
        address indexed recipient,
        uint256 amount
    );
    
    // ============ 修饰符 ============
    
    modifier onlyEscrowParty(uint256 _escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(
            msg.sender == escrow.creator || msg.sender == escrow.accepter,
            "Only escrow parties can call this"
        );
        _;
    }
    
    modifier escrowExists(uint256 _escrowId) {
        require(escrows[_escrowId].orderId != 0, "Escrow does not exist");
        _;
    }
    
    // ============ 构造函数 ============
    
    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
        escrowCounter = 1;
        disputeCounter = 1;
    }
    
    // ============ 托管操作 ============
    
    /**
     * @dev 创建托管
     * @param _orderId 订单 ID
     * @param _accepter 接受者地址 (可选，为 0 表示开放)
     * @param _assetType 资产类型
     * @param _tokenAddress ERC20 代币地址 (如果是 ERC20)
     * @param _amount 金额
     */
    function createEscrow(
        uint256 _orderId,
        address _accepter,
        AssetType _assetType,
        address _tokenAddress,
        uint256 _amount
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_assetType == AssetType.ETH || _tokenAddress != address(0), "Invalid token address");
        
        uint256 escrowId = escrowCounter++;
        
        Escrow storage escrow = escrows[escrowId];
        escrow.escrowId = escrowId;
        escrow.orderId = _orderId;
        escrow.creator = msg.sender;
        escrow.accepter = _accepter;
        escrow.assetType = _assetType;
        escrow.tokenAddress = _tokenAddress;
        escrow.amount = _amount;
        escrow.status = EscrowStatus.PENDING;
        escrow.createdAt = block.timestamp;
        
        emit EscrowCreated(escrowId, _orderId, msg.sender, _amount, _assetType);
        
        return escrowId;
    }
    
    /**
     * @dev 存入资产到托管
     * @param _escrowId 托管 ID
     */
    function fundEscrow(uint256 _escrowId) external payable escrowExists(_escrowId) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        
        require(msg.sender == escrow.creator, "Only creator can fund");
        require(escrow.status == EscrowStatus.PENDING, "Escrow already funded or completed");
        
        if (escrow.assetType == AssetType.ETH) {
            require(msg.value == escrow.amount, "ETH amount mismatch");
        } else {
            require(msg.value == 0, "Do not send ETH for ERC20");
            
            // 转移 ERC20 代币
            bool success = IERC20(escrow.tokenAddress).transferFrom(
                msg.sender,
                address(this),
                escrow.amount
            );
            require(success, "Token transfer failed");
        }
        
        escrow.status = EscrowStatus.FUNDED;
        escrow.fundedAt = block.timestamp;
        
        emit EscrowFunded(_escrowId, msg.sender, escrow.amount);
    }
    
    /**
     * @dev 接受者确认交易
     * @param _escrowId 托管 ID
     */
    function acceptEscrow(uint256 _escrowId) external escrowExists(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        
        require(escrow.status == EscrowStatus.FUNDED, "Escrow not funded");
        require(
            escrow.accepter == address(0) || msg.sender == escrow.accepter,
            "You are not the accepter"
        );
        
        if (escrow.accepter == address(0)) {
            escrow.accepter = msg.sender;
        }
        
        escrow.status = EscrowStatus.ACCEPTED;
        
        emit EscrowAccepted(_escrowId, msg.sender);
    }
    
    /**
     * @dev 完成交易，释放资产
     * @param _escrowId 托管 ID
     */
    function completeEscrow(uint256 _escrowId) external escrowExists(_escrowId) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        
        require(escrow.status == EscrowStatus.ACCEPTED, "Escrow not accepted");
        require(
            msg.sender == escrow.creator || msg.sender == escrow.accepter,
            "Only parties can complete"
        );
        
        escrow.status = EscrowStatus.COMPLETED;
        escrow.completedAt = block.timestamp;
        
        // 计算手续费
        uint256 fee = (escrow.amount * platformFeePercent) / 100;
        uint256 releaseAmount = escrow.amount - fee;
        
        // 转移资产给接受者
        if (escrow.assetType == AssetType.ETH) {
            (bool success, ) = payable(escrow.accepter).call{value: releaseAmount}("");
            require(success, "ETH transfer failed");
            
            // 转移手续费
            if (fee > 0) {
                (bool feeSuccess, ) = payable(feeRecipient).call{value: fee}("");
                require(feeSuccess, "Fee transfer failed");
            }
        } else {
            bool success = IERC20(escrow.tokenAddress).transfer(escrow.accepter, releaseAmount);
            require(success, "Token transfer failed");
            
            // 转移手续费
            if (fee > 0) {
                bool feeSuccess = IERC20(escrow.tokenAddress).transfer(feeRecipient, fee);
                require(feeSuccess, "Fee transfer failed");
            }
        }
        
        emit EscrowCompleted(_escrowId, escrow.accepter, releaseAmount);
    }
    
    /**
     * @dev 创建者取消托管 (仅在 PENDING 状态)
     * @param _escrowId 托管 ID
     */
    function cancelEscrow(uint256 _escrowId) external escrowExists(_escrowId) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        
        require(msg.sender == escrow.creator, "Only creator can cancel");
        require(escrow.status == EscrowStatus.PENDING, "Can only cancel pending escrows");
        
        escrow.status = EscrowStatus.CANCELLED;
        
        emit EscrowCancelled(_escrowId, msg.sender);
    }
    
    /**
     * @dev 创建者在 FUNDED 状态下取消并退款
     * @param _escrowId 托管 ID
     */
    function refundEscrow(uint256 _escrowId) external escrowExists(_escrowId) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        
        require(msg.sender == escrow.creator, "Only creator can refund");
        require(escrow.status == EscrowStatus.FUNDED, "Can only refund funded escrows");
        
        escrow.status = EscrowStatus.CANCELLED;
        
        // 退款
        if (escrow.assetType == AssetType.ETH) {
            (bool success, ) = payable(escrow.creator).call{value: escrow.amount}("");
            require(success, "ETH refund failed");
        } else {
            bool success = IERC20(escrow.tokenAddress).transfer(escrow.creator, escrow.amount);
            require(success, "Token refund failed");
        }
        
        emit EscrowCancelled(_escrowId, msg.sender);
    }
    
    // ============ 争议解决 ============
    
    /**
     * @dev 创建争议
     * @param _escrowId 托管 ID
     * @param _reason 争议原因
     */
    function createDispute(uint256 _escrowId, string memory _reason) 
        external 
        escrowExists(_escrowId)
        onlyEscrowParty(_escrowId)
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.ACCEPTED, "Can only dispute accepted escrows");
        
        uint256 disputeId = disputeCounter++;
        
        Dispute storage dispute = disputes[disputeId];
        dispute.disputeId = disputeId;
        dispute.escrowId = _escrowId;
        dispute.initiator = msg.sender;
        dispute.reason = _reason;
        dispute.createdAt = block.timestamp;
        
        escrow.status = EscrowStatus.DISPUTED;
        
        emit DisputeCreated(disputeId, _escrowId, msg.sender, _reason);
    }
    
    /**
     * @dev 解决争议 (仅 owner)
     * @param _disputeId 争议 ID
     * @param _winner 胜者地址 (creator 或 accepter)
     */
    function resolveDispute(uint256 _disputeId, address _winner) 
        external 
        onlyOwner
    {
        Dispute storage dispute = disputes[_disputeId];
        require(!dispute.resolved, "Dispute already resolved");
        
        Escrow storage escrow = escrows[dispute.escrowId];
        require(escrow.status == EscrowStatus.DISPUTED, "Escrow not disputed");
        
        require(
            _winner == escrow.creator || _winner == escrow.accepter,
            "Winner must be one of the parties"
        );
        
        dispute.resolved = true;
        dispute.winner = _winner;
        escrow.status = EscrowStatus.COMPLETED;
        
        // 转移资产给胜者
        uint256 fee = (escrow.amount * platformFeePercent) / 100;
        uint256 releaseAmount = escrow.amount - fee;
        
        if (escrow.assetType == AssetType.ETH) {
            (bool success, ) = payable(_winner).call{value: releaseAmount}("");
            require(success, "ETH transfer failed");
            
            if (fee > 0) {
                (bool feeSuccess, ) = payable(feeRecipient).call{value: fee}("");
                require(feeSuccess, "Fee transfer failed");
            }
        } else {
            bool success = IERC20(escrow.tokenAddress).transfer(_winner, releaseAmount);
            require(success, "Token transfer failed");
            
            if (fee > 0) {
                bool feeSuccess = IERC20(escrow.tokenAddress).transfer(feeRecipient, fee);
                require(feeSuccess, "Fee transfer failed");
            }
        }
        
        emit DisputeResolved(_disputeId, dispute.escrowId, _winner);
    }
    
    // ============ 管理功能 ============
    
    /**
     * @dev 设置平台手续费百分比
     * @param _percent 百分比 (0-100)
     */
    function setPlatformFeePercent(uint256 _percent) external onlyOwner {
        require(_percent <= 100, "Invalid fee percent");
        platformFeePercent = _percent;
    }
    
    /**
     * @dev 设置争议解决期限
     * @param _period 期限 (秒)
     */
    function setDisputeResolutionPeriod(uint256 _period) external onlyOwner {
        disputeResolutionPeriod = _period;
    }
    
    /**
     * @dev 设置手续费接收地址
     * @param _recipient 接收地址
     */
    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        feeRecipient = _recipient;
    }
    
    /**
     * @dev 取出累积的手续费 (ETH)
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(feeRecipient).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FeeWithdrawn(feeRecipient, balance);
    }
    
    // ============ 查询函数 ============
    
    /**
     * @dev 获取托管详情
     */
    function getEscrow(uint256 _escrowId) 
        external 
        view 
        returns (Escrow memory) 
    {
        return escrows[_escrowId];
    }
    
    /**
     * @dev 获取争议详情
     */
    function getDispute(uint256 _disputeId) 
        external 
        view 
        returns (Dispute memory) 
    {
        return disputes[_disputeId];
    }
    
    /**
     * @dev 获取合约 ETH 余额
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============ 接收 ETH ============
    
    receive() external payable {}
}
