const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting comprehensive testing of MFAI MVP...");
  
  // Load environment variables
  require("dotenv").config();
  
  // Check if we're on a test network
  const network = hre.network.name;
  console.log(`📡 Network: ${network}`);
  
  if (network !== "bscTestnet" && network !== "localhost") {
    console.error("❌ Tests should be run on bscTestnet or localhost");
    process.exit(1);
  }
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Testing with account: ${deployer.address}`);
  
  // Check environment variables
  const requiredEnvVars = [
    "LZ_ENDPOINT_BSC_TESTNET",
    "SOLANA_CHAIN_ID",
    "SOLANA_NFT_PROGRAM"
  ];
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingEnvVars.join(", ")}`);
    process.exit(1);
  }
  
  // Step 1: Deploy Token Contract
  console.log("\n📝 Step 1: Deploying MFAI Token Contract");
  const MFAIToken = await hre.ethers.getContractFactory("MFAIToken");
  const token = await MFAIToken.deploy(process.env.LZ_ENDPOINT_BSC_TESTNET);
  await token.deployed();
  console.log(`✅ MFAI Token deployed to: ${token.address}`);
  
  // Save token address to .env file
  updateEnvFile("TOKEN_ADDRESS", token.address);
  
  // Step 2: Deploy Staking Contract
  console.log("\n📝 Step 2: Deploying MFAI Staking Contract");
  const MFAIStaking = await hre.ethers.getContractFactory("MFAIStaking");
  const staking = await MFAIStaking.deploy(token.address, process.env.LZ_ENDPOINT_BSC_TESTNET);
  await staking.deployed();
  console.log(`✅ MFAI Staking deployed to: ${staking.address}`);
  
  // Save staking address to .env file
  updateEnvFile("STAKING_ADDRESS", staking.address);
  
  // Step 3: Setup LayerZero
  console.log("\n📝 Step 3: Setting up LayerZero");
  
  // Set trusted remote for token contract
  console.log("Setting trusted remote for token contract...");
  const tokenTx = await token.setTrustedRemoteAddress(
    process.env.SOLANA_CHAIN_ID,
    process.env.SOLANA_NFT_PROGRAM
  );
  await tokenTx.wait();
  console.log("✅ Token trusted remote address set");
  
  // Set trusted remote for staking contract
  console.log("Setting trusted remote for staking contract...");
  const stakingTx = await staking.setTrustedRemoteAddress(
    process.env.SOLANA_CHAIN_ID,
    process.env.SOLANA_NFT_PROGRAM
  );
  await stakingTx.wait();
  console.log("✅ Staking trusted remote address set");
  
  // Step 4: Test Token Functionality
  console.log("\n📝 Step 4: Testing Token Functionality");
  
  // Check initial balance
  const initialBalance = await token.balanceOf(deployer.address);
  console.log(`Initial balance: ${ethers.utils.formatEther(initialBalance)} MFAI`);
  
  // Transfer tokens to another address
  const recipient = ethers.Wallet.createRandom().connect(hre.ethers.provider);
  const transferAmount = ethers.utils.parseEther("100");
  
  console.log(`Transferring ${ethers.utils.formatEther(transferAmount)} MFAI to ${recipient.address}`);
  const transferTx = await token.transfer(recipient.address, transferAmount);
  await transferTx.wait();
  
  const recipientBalance = await token.balanceOf(recipient.address);
  console.log(`Recipient balance: ${ethers.utils.formatEther(recipientBalance)} MFAI`);
  
  // Step 5: Test Staking Functionality
  console.log("\n📝 Step 5: Testing Staking Functionality");
  
  // Approve staking contract
  const stakeAmount = ethers.utils.parseEther("50");
  console.log(`Approving ${ethers.utils.formatEther(stakeAmount)} MFAI for staking`);
  const approveTx = await token.approve(staking.address, stakeAmount);
  await approveTx.wait();
  console.log("✅ Staking approval completed");
  
  // Stake tokens
  console.log(`Staking ${ethers.utils.formatEther(stakeAmount)} MFAI`);
  const stakeTx = await staking.stake(stakeAmount);
  await stakeTx.wait();
  console.log("✅ Staking completed");
  
  // Check staked balance
  const stakedBalance = await staking.balanceOf(deployer.address);
  console.log(`Staked balance: ${ethers.utils.formatEther(stakedBalance)} MFAI`);
  
  // Step 6: Test Cross-Chain Functionality
  console.log("\n📝 Step 6: Testing Cross-Chain Functionality");
  
  // Estimate fees for the transfer
  console.log("Estimating fees for cross-chain transfer...");
  const [nativeFee, zroFee] = await token.estimateFee(
    process.env.SOLANA_CHAIN_ID,
    process.env.SOLANA_NFT_PROGRAM,
    transferAmount
  );
  console.log(`Estimated fees: ${ethers.utils.formatEther(nativeFee)} BNB`);
  
  // Send tokens cross-chain
  console.log("Sending tokens cross-chain...");
  const sendTx = await token.send(
    process.env.SOLANA_CHAIN_ID,
    process.env.SOLANA_NFT_PROGRAM,
    transferAmount,
    { value: nativeFee }
  );
  await sendTx.wait();
  console.log("✅ Cross-chain token transfer completed");
  
  // Step 7: Test Rewards
  console.log("\n📝 Step 7: Testing Rewards");
  
  // Wait for some time to accumulate rewards
  console.log("Waiting for rewards to accumulate...");
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Get rewards
  const rewards = await staking.earned(deployer.address);
  console.log(`Accumulated rewards: ${ethers.utils.formatEther(rewards)} MFAI`);
  
  // Claim rewards
  console.log("Claiming rewards...");
  const claimTx = await staking.getReward();
  await claimTx.wait();
  console.log("✅ Rewards claimed");
  
  // Step 8: Test Unstaking
  console.log("\n📝 Step 8: Testing Unstaking");
  
  // Unstake tokens
  console.log(`Unstaking ${ethers.utils.formatEther(stakeAmount)} MFAI`);
  const unstakeTx = await staking.unstake(stakeAmount);
  await unstakeTx.wait();
  console.log("✅ Unstaking completed");
  
  // Check final balance
  const finalBalance = await token.balanceOf(deployer.address);
  console.log(`Final balance: ${ethers.utils.formatEther(finalBalance)} MFAI`);
  
  console.log("\n✅ All tests completed successfully!");
  console.log("📊 Summary:");
  console.log(`- Token Contract: ${token.address}`);
  console.log(`- Staking Contract: ${staking.address}`);
  console.log(`- LayerZero Endpoint: ${process.env.LZ_ENDPOINT_BSC_TESTNET}`);
  console.log(`- Solana Chain ID: ${process.env.SOLANA_CHAIN_ID}`);
  console.log(`- Solana NFT Program: ${process.env.SOLANA_NFT_PROGRAM}`);
}

// Helper function to update .env file
function updateEnvFile(key, value) {
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Check if the key already exists
  const keyRegex = new RegExp(`^${key}=.*$`, 'm');
  if (keyRegex.test(envContent)) {
    // Replace existing key
    envContent = envContent.replace(keyRegex, `${key}=${value}`);
  } else {
    // Add new key
    envContent += `\n${key}=${value}`;
  }
  
  // Write back to .env file
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log(`Updated .env file with ${key}=${value}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error during testing:", error);
    process.exit(1);
  }); 