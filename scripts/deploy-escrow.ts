import { ethers } from 'ethers'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

/**
 * 部署 P2PEscrow 合约脚本
 * 使用: npx ts-node --transpile-only scripts/deploy-escrow.ts
 */

async function main() {
  console.log('🚀 开始部署 P2PEscrow 合约...\n')

  // 读取 Solidity 文件
  const contractPath = path.join(process.cwd(), 'contracts', 'P2PEscrow.sol')
  if (!fs.existsSync(contractPath)) {
    throw new Error(`合约文件不存在: ${contractPath}`)
  }

  console.log('✓ 合约文件已找到')
  console.log(`✓ 部署者地址: ${process.env.DEPLOYER_PRIVATE_KEY ? '已配置' : '未配置'}`)

  // 获取部署私钥
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY 未配置')
  }

  // 选择网络
  const network = process.argv[2] || 'sepolia'
  const rpcUrl = network === 'sepolia' 
    ? (process.env.SEPOLIA_RPC || 'https://sepolia.infura.io/v3/')
    : 'http://localhost:8545'

  console.log(`\n📡 网络: ${network}`)
  console.log(`🌐 RPC: ${rpcUrl}`)

  // 创建 Provider 和 Signer
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const signer = new ethers.Wallet(privateKey, provider)

  console.log(`\n👤 部署者地址: ${signer.address}`)
  
  // 检查余额
  const balance = await provider.getBalance(signer.address)
  console.log(`💰 账户余额: ${ethers.formatEther(balance)} ETH`)

  if (balance === BigInt(0)) {
    throw new Error('账户无余额，无法部署')
  }

  // 读取合约源代码（简化版 - 这里本应用 solc 编译，但由于环境限制，使用 ABI）
  console.log('\n📦 部署合约...')

  // 合约 ABI (已提前定义)
  const P2P_ESCROW_ABI = [
    "constructor(address)",
    "function getEscrow(uint256) view returns (tuple)",
    "function getDispute(uint256) view returns (tuple)",
    "function createEscrow(uint256, address, uint8, address, uint256) returns (uint256)",
    "function fundEscrow(uint256) payable",
    "function acceptEscrow(uint256)",
    "function completeEscrow(uint256)",
    "function cancelEscrow(uint256)",
    "function refundEscrow(uint256)",
    "function createDispute(uint256, string)",
    "function resolveDispute(uint256, address)",
    "function setPlatformFeePercent(uint256)",
    "function setFeeRecipient(address)",
    "function withdrawFees()",
  ]

  // 由于无法直接编译，这里提示用户手动部署
  console.log('\n⚠️  注意:')
  console.log('由于 Hardhat 版本兼容性问题，需要手动编译合约。')
  console.log('\n推荐步骤:')
  console.log('1. 使用 Remix IDE (https://remix.ethereum.org)')
  console.log('2. 上传 contracts/P2PEscrow.sol')
  console.log('3. 使用 Solidity 0.8.20 编译')
  console.log('4. 在 Sepolia 上部署')
  console.log('5. 将合约地址保存到 .env.local:')
  console.log('   NEXT_PUBLIC_ESCROW_SEPOLIA=0x...')
  console.log('   ESCROW_CONTRACT_ADDRESS=0x...')
  
  console.log('\n或者安装 Hardhat:')
  console.log('npm install --save-dev hardhat @nomiclabs/hardhat-ethers')

  // 保存部署信息
  const deploymentInfo = {
    network,
    timestamp: new Date().toISOString(),
    deployerAddress: signer.address,
    rpcUrl,
    status: 'pending',
    note: '请通过 Remix IDE 或其他工具部署合约，然后更新地址'
  }

  const deploymentPath = path.join(process.cwd(), 'deployment.json')
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))
  
  console.log('\n✅ 部署信息已保存到: deployment.json')
  console.log('📝 请手动部署合约后，更新 .env.local')
}

main().catch(error => {
  console.error('❌ 错误:', error.message)
  process.exit(1)
})
