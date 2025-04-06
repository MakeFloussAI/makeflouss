const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Testing cross-chain functionality with the account:", deployer.address);

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

  // Test token transfer cross-chain
  console.log("Testing token transfer cross-chain...");
  const transferAmount = ethers.utils.parseEther("100");
  
  // Estimate fees for the transfer
  const [nativeFee, zroFee] = await token.estimateFee(
    process.env.SOLANA_CHAIN_ID,
    solanaProgram,
    transferAmount
  );
  console.log("Estimated fees:", { nativeFee: nativeFee.toString(), zroFee: zroFee.toString() });

  // Send tokens cross-chain
  const sendTx = await token.send(
    process.env.SOLANA_CHAIN_ID,
    solanaProgram,
    transferAmount,
    { value: nativeFee }
  );
  await sendTx.wait();
  console.log("Cross-chain token transfer completed");

  // Test staking cross-chain
  console.log("Testing staking cross-chain...");
  const stakeAmount = ethers.utils.parseEther("50");
  
  // Approve staking contract
  const approveTx = await token.approve(stakingAddress, stakeAmount);
  await approveTx.wait();
  console.log("Staking approval completed");

  // Stake tokens
  const stakeTx = await staking.stake(stakeAmount);
  await stakeTx.wait();
  console.log("Staking completed");

  // Wait for some time to accumulate rewards
  console.log("Waiting for rewards to accumulate...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Get rewards
  const rewards = await staking.earned(deployer.address);
  console.log("Accumulated rewards:", ethers.utils.formatEther(rewards));

  // Claim rewards
  const claimTx = await staking.getReward();
  await claimTx.wait();
  console.log("Rewards claimed");

  console.log("Cross-chain testing completed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 