const hre = require('hardhat');

async function main() {
  const [creator, accepter] = await hre.ethers.getSigners();

  const P2PEscrow = await hre.ethers.getContractFactory('P2PEscrow');
  const escrow = await P2PEscrow.deploy(creator.address);
  await escrow.deployed();

  console.log('Escrow deployed:', escrow.address);

  // create escrow
  const tx = await escrow.connect(creator).createEscrow(1, accepter.address, 0, hre.ethers.constants.AddressZero, hre.ethers.utils.parseEther('0.01'));
  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === 'EscrowCreated');
  console.log('Created escrow event:', event.args.escrowId.toString());

  const escrowId = event.args.escrowId;

  // fund escrow (send ETH)
  await escrow.connect(creator).fundEscrow(escrowId, { value: hre.ethers.utils.parseEther('0.01') });
  console.log('Escrow funded');

  // accept
  await escrow.connect(accepter).acceptEscrow(escrowId);
  console.log('Escrow accepted');

  // complete
  await escrow.connect(accepter).completeEscrow(escrowId);
  console.log('Escrow completed');
}

main().catch((e) => { console.error(e); process.exit(1); });
