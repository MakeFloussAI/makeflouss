# MFAI MVP Pitch Test API

This project implements a token and staking system for the MFAI platform, with cross-chain capabilities using LayerZero.

## Project Structure

```
MFAI_MVP_Pitch_Test_API/
├── contracts/
│   ├── MFAIToken.sol
│   └── MFAIStaking.sol
├── scripts/
│   ├── deploy-token.js
│   ├── deploy-staking.js
│   ├── setup-layerzero.js
│   └── test-cross-chain.js
├── test/
│   └── MFAIStaking.test.js
├── hardhat.config.js
├── package.json
└── .env
```

## Features

- ERC20 Token with pausable functionality
- Staking contract with reward distribution
- Cross-chain compatibility using LayerZero
- Comprehensive test suite
- Deployment scripts for different networks

## Cross-Chain Functionality

The MFAI Token implements cross-chain transfers using LayerZero:

- Tokens can be sent from one chain to another
- When tokens are sent cross-chain, they are burned on the source chain and minted on the destination chain
- The contract maintains trusted remote addresses for each supported chain
- Cross-chain transfers require gas fees to be paid on the destination chain

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Hardhat
- LayerZero endpoint addresses for each network

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a .env file and fill in the required environment variables:
```
ETHEREUM_RPC_URL=
BSC_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
BSCSCAN_API_KEY=
MFAI_TOKEN_ADDRESS=
MFAI_STAKING_ADDRESS=
```

## Testing

Run the test suite:
```bash
npx hardhat test
```

## Deployment

1. Deploy the token:
```bash
npx hardhat run scripts/deploy-token.js --network <network>
```

2. Deploy the staking contract:
```bash
npx hardhat run scripts/deploy-staking.js --network <network>
```

3. Set up LayerZero for cross-chain functionality:
```bash
npx hardhat run scripts/setup-layerzero.js --network <network> <token-address>
```

4. Test cross-chain transfers:
```bash
npx hardhat run scripts/test-cross-chain.js --network <network> <token-address> <destination-chain>
```

## Supported Networks

- Ethereum Mainnet
- Goerli Testnet
- BSC Mainnet
- BSC Testnet

## Security

- All contracts are audited and follow best practices
- Pausable functionality for emergency situations
- Access control for administrative functions
- Reentrancy protection
- Cross-chain security through LayerZero's trusted remote verification

## License

MIT 