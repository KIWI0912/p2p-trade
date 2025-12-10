const hre = require('hardhat');
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;

  const P2PEscrow = await hre.ethers.getContractFactory('P2PEscrow');
  const escrow = await P2PEscrow.deploy(feeRecipient);
  await escrow.deployed();

  console.log('P2PEscrow deployed to:', escrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
