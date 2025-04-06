const { ethers } = require("hardhat");
const { isNetworkEnabled, getNetworkConfig } = require("./utils/network-config");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  // Obtenir la configuration BSC
  const bscConfig = getNetworkConfig('bsc');
  
  // Vérifier si Ethereum est activé avant d'essayer d'obtenir sa configuration
  const ethereumEnabled = isNetworkEnabled('ethereum');
  let ethereumConfig = null;
  if (ethereumEnabled) {
    ethereumConfig = getNetworkConfig('ethereum');
  }
  
  // Déployer le MFAIToken sur BSC
  console.log("Deploying MFAIToken...");
  const lzEndpoint = process.env.LZ_ENDPOINT_BSC_TESTNET;
  console.log(`Using LayerZero endpoint: ${lzEndpoint}`);
  
  const MFAIToken = await ethers.getContractFactory("MFAIToken");
  const token = await MFAIToken.deploy(lzEndpoint);
  await token.deployed();
  
  console.log(`MFAIToken deployed to: ${token.address}`);
  
  // Enregistrer l'adresse pour faciliter la vérification
  console.log("\nTo verify on BSCScan:");
  console.log(`npx hardhat verify --network bscTestnet ${token.address} ${lzEndpoint}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });