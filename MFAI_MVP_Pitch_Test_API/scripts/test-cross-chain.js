const hre = require("hardhat");
const { ethers } = require("hardhat");
const { getNetworkConfig, getContractAddress } = require("./utils/network-config");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Testing cross-chain transfers with account:", deployer.address);

  // Obtenir la configuration du réseau actuel
  const networkConfig = getNetworkConfig('ethereum'); // Par défaut, on teste sur Ethereum
  console.log(`Testing on ${networkConfig.mode} network`);

  // Get the token address from environment or command line
  const tokenAddress = process.env.MFAI_TOKEN_ADDRESS || process.argv[2];
  if (!tokenAddress) {
    throw new Error("Please provide the token address as an argument or set MFAI_TOKEN_ADDRESS in .env");
  }

  console.log("Token address:", tokenAddress);

  // Get the token contract
  const MFAIToken = await ethers.getContractFactory("MFAIToken");
  const token = await MFAIToken.attach(tokenAddress);

  // Get the destination chain from command line or use a default
  const destinationChain = process.argv[3] || "bsc";
  const destinationConfig = getNetworkConfig(destinationChain);
  
  console.log(`Testing transfer to ${destinationChain} (${destinationConfig.mode})`);
  console.log(`Destination Chain ID: ${destinationConfig.chainId}`);

  // Amount to transfer (1 token)
  const amount = ethers.utils.parseEther("1");
  
  // Check balance
  const balance = await token.balanceOf(deployer.address);
  console.log("Current balance:", ethers.utils.formatEther(balance));
  
  if (balance.lt(amount)) {
    throw new Error("Insufficient balance for cross-chain transfer");
  }

  // Approve tokens for the token contract
  console.log("Approving tokens...");
  const approveTx = await token.approve(tokenAddress, amount);
  await approveTx.wait();
  console.log("Tokens approved");

  // Prepare adapter parameters
  const adapterParams = ethers.utils.solidityPack(
    ["uint16", "uint256"],
    [1, 200000] // version 1, gas limit 200000
  );

  // Send tokens cross-chain
  console.log("Sending tokens cross-chain...");
  const sendTx = await token.sendTokens(
    destinationConfig.chainId,
    deployer.address, // recipient address (same as sender for testing)
    amount,
    deployer.address, // refund address
    ethers.constants.AddressZero, // zroPaymentAddress
    adapterParams,
    { value: ethers.utils.parseEther("0.01") } // value for gas
  );
  
  console.log("Transaction sent:", sendTx.hash);
  const receipt = await sendTx.wait();
  console.log("Transaction confirmed:", receipt.transactionHash);
  
  console.log("Cross-chain transfer initiated successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 