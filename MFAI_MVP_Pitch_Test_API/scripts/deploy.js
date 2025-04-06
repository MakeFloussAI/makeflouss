const hre = require("hardhat");
const { getNetworkConfig } = require("./utils/network-config");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Obtenir la configuration du réseau actuel
  const networkConfig = getNetworkConfig('ethereum'); // Par défaut, on déploie sur Ethereum
  console.log(`Deploying to ${networkConfig.mode} network`);

  // Deploy MFAI Token
  const MFAIToken = await hre.ethers.getContractFactory("MFAIToken");
  const token = await MFAIToken.deploy(networkConfig.lzEndpoint);
  await token.deployed();
  console.log("MFAI Token deployed to:", token.address);

  // Deploy Staking Contract
  const MFAIStaking = await hre.ethers.getContractFactory("MFAIStaking");
  const staking = await MFAIStaking.deploy(token.address);
  await staking.deployed();
  console.log("MFAI Staking deployed to:", staking.address);

  // Transfer some tokens to the staking contract
  const transferAmount = hre.ethers.utils.parseEther("1000000"); // 1M tokens
  await token.transfer(staking.address, transferAmount);
  console.log("Transferred", transferAmount.toString(), "tokens to staking contract");

  // Afficher les informations de déploiement
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log(`Network: ${networkConfig.mode}`);
  console.log(`Chain ID: ${networkConfig.chainId}`);
  console.log(`LayerZero Endpoint: ${networkConfig.lzEndpoint}`);
  console.log(`MFAI Token: ${token.address}`);
  console.log(`MFAI Staking: ${staking.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 