require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();
const { getNetworkConfig, isNetworkEnabled } = require("./scripts/utils/network-config");

// Validation des variables d'environnement requises
const requiredEnvVars = [
  'PRIVATE_KEY',
  'BSC_TESTNET_RPC_URL',
  'BSC_TESTNET_CHAIN_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set in environment variables`);
  }
}

// Obtenir les configurations des réseaux
const bscConfig = getNetworkConfig('bsc');
// Vérifier si ethereum est activé avant de récupérer sa configuration
const ethereumEnabled = isNetworkEnabled('ethereum');
const ethereumConfig = ethereumEnabled ? getNetworkConfig('ethereum') : { rpcUrl: '', chainId: 1 };

// Configuration des réseaux
const config = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: process.env.FORK_CHAIN_ID ? parseInt(process.env.FORK_CHAIN_ID) : 1337,
      forking: process.env.FORK_ENABLED === 'true' && ethereumEnabled ? {
        url: ethereumConfig.rpcUrl,
        blockNumber: process.env.FORK_BLOCK_NUMBER === 'latest' ? undefined : parseInt(process.env.FORK_BLOCK_NUMBER)
      } : undefined,
      gas: process.env.GAS_LIMIT === 'auto' ? 'auto' : parseInt(process.env.GAS_LIMIT),
      gasPrice: process.env.GAS_PRICE === 'auto' ? 'auto' : parseInt(process.env.GAS_PRICE)
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: process.env.TEST_PRIVATE_KEY ? [process.env.TEST_PRIVATE_KEY] : undefined
    },
    // BSC networks
    bsc: {
      url: bscConfig.rpcUrl,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: bscConfig.chainId,
      gasPrice: process.env.GAS_PRICE === 'auto' ? 'auto' : parseInt(process.env.GAS_PRICE)
    },
    bscTestnet: {
      url: bscConfig.rpcUrl,
      chainId: bscConfig.chainId,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: process.env.GAS_PRICE === 'auto' ? 'auto' : parseInt(process.env.GAS_PRICE)
    }
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};

// Ajouter conditionnellement les réseaux Ethereum
if (ethereumEnabled) {
  config.networks.ethereum = {
    url: ethereumConfig.rpcUrl,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: ethereumConfig.chainId,
    gasPrice: process.env.GAS_PRICE === 'auto' ? 'auto' : parseInt(process.env.GAS_PRICE)
  };
  config.networks.goerli = {
    url: ethereumConfig.rpcUrl,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: ethereumConfig.chainId,
    gasPrice: process.env.GAS_PRICE === 'auto' ? 'auto' : parseInt(process.env.GAS_PRICE)
  };
  config.etherscan.apiKey.mainnet = process.env.ETHERSCAN_API_KEY;
  config.etherscan.apiKey.goerli = process.env.ETHERSCAN_API_KEY;
}

// Export de la configuration
module.exports = config;