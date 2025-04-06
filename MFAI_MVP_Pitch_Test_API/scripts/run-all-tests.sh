#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Démarrage des tests...${NC}"

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo -e "${RED}Erreur: Fichier .env non trouvé${NC}"
    exit 1
fi

# Vérifier les dépendances
echo -e "${YELLOW}Vérification des dépendances...${NC}"

# Node.js et npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}Erreur: Node.js n'est pas installé${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Erreur: npm n'est pas installé${NC}"
    exit 1
fi

# Rust et Cargo
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Erreur: Rust/Cargo n'est pas installé${NC}"
    exit 1
fi

# Solana CLI
if ! command -v solana &> /dev/null; then
    echo -e "${RED}Erreur: Solana CLI n'est pas installé${NC}"
    exit 1
fi

# Installer les dépendances Node.js
echo -e "${YELLOW}Installation des dépendances Node.js...${NC}"
npm install

# Tester les contrats Ethereum/BSC
echo -e "${YELLOW}Test des contrats Ethereum/BSC...${NC}"
if npx hardhat test; then
    echo -e "${GREEN}Tests des contrats réussis${NC}"
else
    echo -e "${RED}Tests des contrats échoués${NC}"
    exit 1
fi

# Tester le programme NFT Solana
echo -e "${YELLOW}Test du programme NFT Solana...${NC}"
cd solana/nft-program
if cargo test; then
    echo -e "${GREEN}Tests du programme NFT réussis${NC}"
else
    echo -e "${RED}Tests du programme NFT échoués${NC}"
    exit 1
fi
cd ../..

# Tester la fonctionnalité cross-chain
echo -e "${YELLOW}Test de la fonctionnalité cross-chain...${NC}"
if npx hardhat run scripts/test-cross-chain.js --network localhost; then
    echo -e "${GREEN}Tests cross-chain réussis${NC}"
else
    echo -e "${RED}Tests cross-chain échoués${NC}"
    exit 1
fi

echo -e "${GREEN}Tous les tests ont été exécutés avec succès!${NC}"
