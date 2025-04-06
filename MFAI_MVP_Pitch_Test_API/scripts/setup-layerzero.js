const hre = require("hardhat");
const { getNetworkConfig, getContractAddress } = require("./utils/network-config");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Setting up LayerZero with account:", deployer.address);

  // Obtenir la configuration du réseau actuel
  const networkConfig = getNetworkConfig('ethereum'); // Par défaut, on configure sur Ethereum
  console.log(`Setting up LayerZero on ${networkConfig.mode} network`);

  // Get the token address from environment or command line
  const tokenAddress = process.env.MFAI_TOKEN_ADDRESS || process.argv[2];
  if (!tokenAddress) {
    throw new Error("Please provide the token address as an argument or set MFAI_TOKEN_ADDRESS in .env");
  }

  console.log("Token address:", tokenAddress);

  // Get the token contract
  const MFAIToken = await hre.ethers.getContractFactory("MFAIToken");
  const token = await MFAIToken.attach(tokenAddress);

  // Obtenir les configurations des autres réseaux
  const bscConfig = getNetworkConfig('bsc');
  const ethereumConfig = getNetworkConfig('ethereum');
  const solanaConfig = getNetworkConfig('solana');

  // Define trusted remote addresses for different networks
  const trustedRemotes = {
    bsc: getContractAddress('bsc', 'MFAI_TOKEN'),
    ethereum: getContractAddress('ethereum', 'MFAI_TOKEN'),
    solana: getContractAddress('solana', 'MFAI_TOKEN')
  };

  // Set trusted remote addresses for each network
  for (const [chain, address] of Object.entries(trustedRemotes)) {
    if (address) {
      console.log(`Setting trusted remote for ${chain} to ${address}`);
      const tx = await token.setTrustedRemoteAddress(
        getChainId(chain),
        address
      );
      await tx.wait();
      console.log(`Trusted remote for ${chain} set successfully`);
    } else {
      console.log(`Skipping ${chain} - no contract address available`);
    }
  }

  console.log("LayerZero setup completed");
}

// Helper function to get chain ID
function getChainId(network) {
  const config = getNetworkConfig(network);
  return config.chainId;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 