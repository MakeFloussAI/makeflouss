const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MFAI Token first
  console.log("Deploying MFAI Token...");
  const MFAIToken = await hre.ethers.getContractFactory("MFAIToken");
  const token = await MFAIToken.deploy();
  await token.deployed();
  console.log("MFAI Token deployed to:", token.address);

  // Deploy Staking contract
  console.log("Deploying MFAI Staking...");
  const MFAIStaking = await hre.ethers.getContractFactory("MFAIStaking");
  const staking = await MFAIStaking.deploy(token.address);
  await staking.deployed();
  console.log("MFAI Staking deployed to:", staking.address);

  // Transfer some tokens to the staking contract for rewards
  const transferAmount = hre.ethers.utils.parseEther("1000000"); // 1 million tokens
  await token.transfer(staking.address, transferAmount);
  console.log("Transferred", transferAmount.toString(), "tokens to staking contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 