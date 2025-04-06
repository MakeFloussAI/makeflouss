const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the token address and LayerZero endpoint from environment variables
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const lzEndpoint = process.env.LZ_ENDPOINT_BSC_TESTNET;

  if (!tokenAddress) {
    throw new Error("Token address not found in environment variables");
  }
  if (!lzEndpoint) {
    throw new Error("LayerZero endpoint address not found in environment variables");
  }

  // Deploy MFAI Staking
  const MFAIStaking = await hre.ethers.getContractFactory("MFAIStaking");
  const staking = await MFAIStaking.deploy(tokenAddress, lzEndpoint);
  await staking.deployed();

  console.log("MFAI Staking deployed to:", staking.address);
  console.log("Token address:", tokenAddress);
  console.log("LayerZero endpoint:", lzEndpoint);

  // Verify the contract on BSCScan
  if (process.env.BSCSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await staking.deployTransaction.wait(6);
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: staking.address,
      constructorArguments: [tokenAddress, lzEndpoint],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 