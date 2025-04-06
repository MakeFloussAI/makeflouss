const hre = require("hardhat");
const { getNetworkConfig } = require("./utils/network-config");

async function main() {
  console.log("Deploying MFAI Token...");

  // Obtenir la configuration du réseau actuel
  const networkConfig = getNetworkConfig('ethereum'); // Par défaut, on déploie sur Ethereum
  console.log(`Deploying to ${networkConfig.mode} network`);
  console.log(`Using LayerZero endpoint: ${networkConfig.lzEndpoint}`);

  const MFAIToken = await hre.ethers.getContractFactory("MFAIToken");
  const token = await MFAIToken.deploy(networkConfig.lzEndpoint);

  await token.deployed();

  console.log("MFAI Token deployed to:", token.address);
  console.log("LayerZero endpoint:", networkConfig.lzEndpoint);

  // Afficher les informations de déploiement
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log(`Network: ${networkConfig.mode}`);
  console.log(`Chain ID: ${networkConfig.chainId}`);
  console.log(`LayerZero Endpoint: ${networkConfig.lzEndpoint}`);
  console.log(`MFAI Token: ${token.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 