require('dotenv').config();

// Variables requises pour chaque réseau
const requiredEnvVars = {
  common: [
    'PRIVATE_KEY',
    'DEPLOYER_PRIVATE_KEY'
  ],
  bscTestnet: [
    'BSC_TESTNET_RPC_URL',
    'BSC_TESTNET_CHAIN_ID',
    'LZ_ENDPOINT_BSC_TESTNET',
    'BSC_PRIVATE_KEY',
    'BSC_ENABLED',
    'BSC_NETWORK_MODE'
  ],
  bscMainnet: [
    'BSC_MAINNET_RPC_URL',
    'BSC_MAINNET_CHAIN_ID',
    'LZ_ENDPOINT_BSC_MAINNET',
    'BSC_PRIVATE_KEY',
    'BSC_ENABLED',
    'BSC_NETWORK_MODE'
  ],
  ethereumMainnet: [
    'ETHEREUM_MAINNET_RPC_URL',
    'ETHEREUM_MAINNET_CHAIN_ID',
    'LZ_ENDPOINT_ETHEREUM_MAINNET',
    'ETHEREUM_ENABLED',
    'ETHEREUM_NETWORK_MODE'
  ],
  goerli: [
    'GOERLI_RPC_URL',
    'GOERLI_CHAIN_ID',
    'LZ_ENDPOINT_GOERLI',
    'ETHEREUM_ENABLED',
    'ETHEREUM_NETWORK_MODE'
  ],
  solanaDevnet: [
    'SOLANA_DEVNET_RPC_URL',
    'LZ_ENDPOINT_SOLANA_DEVNET',
    'SOLANA_NFT_PROGRAM_DEVNET',
    'SOLANA_PRIVATE_KEY',
    'SOLANA_ENABLED',
    'SOLANA_NETWORK_MODE'
  ],
  solanaTestnet: [
    'SOLANA_TESTNET_RPC_URL',
    'LZ_ENDPOINT_SOLANA_TESTNET',
    'SOLANA_NFT_PROGRAM_TESTNET',
    'SOLANA_PRIVATE_KEY',
    'SOLANA_ENABLED',
    'SOLANA_NETWORK_MODE'
  ],
  solanaMainnet: [
    'SOLANA_MAINNET_RPC_URL',
    'LZ_ENDPOINT_SOLANA_MAINNET',
    'SOLANA_NFT_PROGRAM_MAINNET',
    'SOLANA_PRIVATE_KEY',
    'SOLANA_ENABLED',
    'SOLANA_NETWORK_MODE'
  ]
};

// Variables optionnelles
const optionalEnvVars = [
  'ETHERSCAN_API_KEY',
  'BSCSCAN_API_KEY',
  'ALCHEMY_API_KEY',
  'INFURA_API_KEY',
  'SOLANA_API_KEY',
  'GAS_PRICE',
  'GAS_LIMIT',
  'PRIORITY_FEE',
  'FORK_ENABLED',
  'FORK_BLOCK_NUMBER',
  'FORK_CHAIN_ID',
  'TEST_PRIVATE_KEY'
];

// Feature flags
const featureFlags = [
  'FEATURE_STAKING_ENABLED',
  'FEATURE_CROSS_CHAIN_ENABLED',
  'FEATURE_NFT_ENABLED',
  'FEATURE_REWARDS_ENABLED',
  'FEATURE_GOVERNANCE_ENABLED'
];

// Modes de réseau valides
const validNetworkModes = {
  bsc: ['testnet', 'mainnet'],
  ethereum: ['testnet', 'mainnet'],
  solana: ['devnet', 'testnet', 'mainnet']
};

console.log('Checking environment variables...\n');

// Fonction pour vérifier les variables d'un réseau
function checkNetworkVars(networkName, vars) {
  console.log(`\n${networkName} variables:`);
  let missing = false;
  
  for (const envVar of vars) {
    if (!process.env[envVar]) {
      console.log(`❌ ${envVar} is not set`);
      missing = true;
    } else if (envVar.endsWith('_ENABLED')) {
      const isEnabled = process.env[envVar].toLowerCase() === 'true';
      console.log(`${isEnabled ? '✅' : '⏸️'} ${envVar} is set to ${isEnabled}`);
    } else if (envVar.endsWith('_NETWORK_MODE')) {
      const mode = process.env[envVar].toLowerCase();
      const blockchain = envVar.split('_')[0].toLowerCase();
      const isValidMode = validNetworkModes[blockchain].includes(mode);
      console.log(`${isValidMode ? '✅' : '❌'} ${envVar} is set to ${mode} ${isValidMode ? '' : '(invalid mode)'}`);
      if (!isValidMode) missing = true;
    } else {
      console.log(`✅ ${envVar} is set`);
    }
  }
  
  return missing;
}

// Vérifier les variables communes
let missingRequired = false;
console.log('Common variables:');
for (const envVar of requiredEnvVars.common) {
  if (!process.env[envVar]) {
    console.log(`❌ ${envVar} is not set`);
    missingRequired = true;
  } else {
    console.log(`✅ ${envVar} is set`);
  }
}

// Vérifier les variables pour chaque réseau
const networks = [
  { name: 'BSC Testnet', vars: requiredEnvVars.bscTestnet },
  { name: 'BSC Mainnet', vars: requiredEnvVars.bscMainnet },
  { name: 'Ethereum Mainnet', vars: requiredEnvVars.ethereumMainnet },
  { name: 'Goerli Testnet', vars: requiredEnvVars.goerli },
  { name: 'Solana Devnet', vars: requiredEnvVars.solanaDevnet },
  { name: 'Solana Testnet', vars: requiredEnvVars.solanaTestnet },
  { name: 'Solana Mainnet', vars: requiredEnvVars.solanaMainnet }
];

for (const network of networks) {
  if (checkNetworkVars(network.name, network.vars)) {
    missingRequired = true;
  }
}

// Vérifier les feature flags
console.log('\nFeature flags:');
for (const flag of featureFlags) {
  if (!process.env[flag]) {
    console.log(`⚠️  ${flag} is not set (defaulting to false)`);
  } else {
    const isEnabled = process.env[flag].toLowerCase() === 'true';
    console.log(`${isEnabled ? '✅' : '⏸️'} ${flag} is set to ${isEnabled}`);
  }
}

// Vérifier les variables optionnelles
console.log('\nOptional variables:');
for (const envVar of optionalEnvVars) {
  if (!process.env[envVar]) {
    console.log(`⚠️  ${envVar} is not set`);
  } else {
    console.log(`✅ ${envVar} is set`);
  }
}

// Vérifier les configurations automatiques
console.log('\nAuto configurations:');
const autoConfigs = ['GAS_PRICE', 'GAS_LIMIT', 'PRIORITY_FEE'];
for (const config of autoConfigs) {
  if (process.env[config] === 'auto') {
    console.log(`✅ ${config} is set to auto`);
  } else if (!process.env[config]) {
    console.log(`⚠️  ${config} is not set (will use auto)`);
  } else {
    console.log(`ℹ️  ${config} is set to custom value: ${process.env[config]}`);
  }
}

if (missingRequired) {
  console.log('\n❌ Some required variables are missing or invalid. Please check your .env file.');
  process.exit(1);
} else {
  console.log('\n✅ All required variables are set and valid.');
} 