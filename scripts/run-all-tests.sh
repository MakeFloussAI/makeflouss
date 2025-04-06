#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting comprehensive testing of MFAI MVP...${NC}"

# Vérifier si .env existe
if [ ! -f .env ]; then
  echo -e "${RED}❌ .env file not found. Please create one with the required variables.${NC}"
  exit 1
fi

# Vérifier les dépendances
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed. Please install it first.${NC}"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm is not installed. Please install it first.${NC}"
  exit 1
fi

if ! command -v cargo &> /dev/null; then
  echo -e "${RED}❌ Rust/Cargo is not installed. Please install it first.${NC}"
  exit 1
fi

if ! command -v solana &> /dev/null; then
  echo -e "${RED}❌ Solana CLI is not installed. Please install it first.${NC}"
  exit 1
fi

# Installer les dépendances Node.js si nécessaire
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
npm install

# Tester les contrats Ethereum/BSC
echo -e "${YELLOW}🔍 Testing Ethereum/BSC contracts...${NC}"
npx hardhat test

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Ethereum/BSC tests failed.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Ethereum/BSC tests passed.${NC}"

# Tester le programme NFT Solana
echo -e "${YELLOW}🔍 Testing Solana NFT program...${NC}"
cd solana/nft-program
cargo test

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Solana NFT program tests failed.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Solana NFT program tests passed.${NC}"
cd ../..

# Exécuter le script de test complet
echo -e "${YELLOW}🔍 Running comprehensive test script...${NC}"
npx hardhat run scripts/test-all.js --network localhost

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Comprehensive test script failed.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Comprehensive test script passed.${NC}"

echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
echo -e "${YELLOW}📊 Summary:${NC}"
echo -e "  - Ethereum/BSC contracts: ${GREEN}✅${NC}"
echo -e "  - Solana NFT program: ${GREEN}✅${NC}"
echo -e "  - Comprehensive tests: ${GREEN}✅${NC}" 