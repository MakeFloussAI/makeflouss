const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Setting up LayerZero with the account:", deployer.address);

  // Get contract addresses from environment variables
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const stakingAddress = process.env.STAKING_ADDRESS;
  const solanaProgram = process.env.SOLANA_NFT_PROGRAM;

  if (!tokenAddress || !stakingAddress || !solanaProgram) {
    throw new Error("Contract addresses not found in environment variables");
  }

  // Get the deployed contracts
  const MFAIToken = await hre.ethers.getContractFactory("MFAIToken");
  const MFAIStaking = await hre.ethers.getContractFactory("MFAIStaking");
  
  const token = await MFAIToken.attach(tokenAddress);
  const staking = await MFAIStaking.attach(stakingAddress);

  // Set trusted remote addresses for cross-chain communication
  console.log("Setting up trusted remote addresses...");

  // Set trusted remote for token contract
  const tokenTx = await token.setTrustedRemoteAddress(
    process.env.SOLANA_CHAIN_ID,
    solanaProgram
  );
  await tokenTx.wait();
  console.log("Token trusted remote address set");

  // Set trusted remote for staking contract
  const stakingTx = await staking.setTrustedRemoteAddress(
    process.env.SOLANA_CHAIN_ID,
    solanaProgram
  );
  await stakingTx.wait();
  console.log("Staking trusted remote address set");

  console.log("LayerZero setup completed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 