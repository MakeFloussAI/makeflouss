require('dotenv').config();

// Modes de réseau valides
const VALID_NETWORK_MODES = {
  bsc: ['testnet', 'mainnet'],
  ethereum: ['testnet', 'mainnet'],
  solana: ['devnet', 'testnet', 'mainnet']
};

// Configuration des endpoints LayerZero
const LZ_ENDPOINTS = {
  bsc: {
    testnet: '0x6Fcb97553D16Ea1B2B5F1B0B6B7Bc0B6B7Bc0B6B7',
    mainnet: '0x3c2269811836af69497E5F486A85D7316753cf62'
  },
  ethereum: {
    testnet: '0xbfD2135BFfbb0B5378b56643c2D8fA11D56BCa25', // Goerli
    mainnet: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675'
  },
  solana: {
    devnet: process.env.LZ_ENDPOINT_SOLANA_DEVNET || '0x0000000000000000000000000000000000000000',
    testnet: process.env.LZ_ENDPOINT_SOLANA_TESTNET || '0x0000000000000000000000000000000000000000',
    mainnet: process.env.LZ_ENDPOINT_SOLANA_MAINNET || '0x0000000000000000000000000000000000000000'
  }
};

// Configuration des RPC URLs
const RPC_URLS = {
  bsc: {
    testnet: process.env.BSC_TESTNET_RPC_URL,
    mainnet: process.env.BSC_MAINNET_RPC_URL
  },
  ethereum: {
    testnet: process.env.GOERLI_RPC_URL,
    mainnet: process.env.ETHEREUM_MAINNET_RPC_URL
  },
  solana: {
    devnet: process.env.SOLANA_DEVNET_RPC_URL,
    testnet: process.env.SOLANA_TESTNET_RPC_URL,
    mainnet: process.env.SOLANA_MAINNET_RPC_URL
  }
};

// Configuration des Chain IDs
const CHAIN_IDS = {
  bsc: {
    testnet: parseInt(process.env.BSC_TESTNET_CHAIN_ID || '97'),
    mainnet: parseInt(process.env.BSC_MAINNET_CHAIN_ID || '56')
  },
  ethereum: {
    testnet: parseInt(process.env.GOERLI_CHAIN_ID || '5'),
    mainnet: parseInt(process.env.ETHEREUM_MAINNET_CHAIN_ID || '1')
  }
};

// Fonction pour obtenir le mode de réseau actuel
function getCurrentNetworkMode(blockchain) {
  const mode = process.env[`${blockchain.toUpperCase()}_NETWORK_MODE`];
  if (!mode) {
    console.warn(`Warning: ${blockchain.toUpperCase()}_NETWORK_MODE not set, defaulting to testnet/devnet`);
    return blockchain === 'solana' ? 'devnet' : 'testnet';
  }
  
  if (!VALID_NETWORK_MODES[blockchain].includes(mode.toLowerCase())) {
    console.warn(`Warning: Invalid ${blockchain} network mode: ${mode}, defaulting to testnet/devnet`);
    return blockchain === 'solana' ? 'devnet' : 'testnet';
  }
  
  return mode.toLowerCase();
}

// Fonction pour vérifier si un réseau est activé
function isNetworkEnabled(blockchain) {
  return process.env[`${blockchain.toUpperCase()}_ENABLED`]?.toLowerCase() === 'true';
}

// Fonction pour obtenir la configuration complète d'un réseau
function getNetworkConfig(blockchain) {
  if (!isNetworkEnabled(blockchain)) {
    throw new Error(`${blockchain} network is not enabled`);
  }
  
  const mode = getCurrentNetworkMode(blockchain);
  
  return {
    mode,
    enabled: true,
    rpcUrl: RPC_URLS[blockchain][mode],
    chainId: CHAIN_IDS[blockchain]?.[mode],
    lzEndpoint: LZ_ENDPOINTS[blockchain][mode]
  };
}

// Fonction pour obtenir l'adresse du contrat en fonction du réseau
function getContractAddress(blockchain, contractName) {
  const mode = getCurrentNetworkMode(blockchain);
  return process.env[`${contractName.toUpperCase()}_ADDRESS_${blockchain.toUpperCase()}_${mode.toUpperCase()}`];
}

// Fonction pour obtenir la configuration de déploiement
function getDeploymentConfig() {
  return {
    bsc: getNetworkConfig('bsc'),
    ethereum: getNetworkConfig('ethereum'),
    solana: getNetworkConfig('solana')
  };
}

module.exports = {
  VALID_NETWORK_MODES,
  getCurrentNetworkMode,
  isNetworkEnabled,
  getNetworkConfig,
  getContractAddress,
  getDeploymentConfig
}; 