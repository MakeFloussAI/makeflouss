const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the LayerZero endpoint address from environment variables
  const lzEndpoint = process.env.LZ_ENDPOINT_BSC_TESTNET;
  if (!lzEndpoint) {
    throw new Error("LayerZero endpoint address not found in environment variables");
  }

  // Deploy MFAI Token
  const MFAIToken = await hre.ethers.getContractFactory("MFAIToken");
  const token = await MFAIToken.deploy(lzEndpoint);
  await token.deployed();

  console.log("MFAI Token deployed to:", token.address);
  console.log("LayerZero endpoint:", lzEndpoint);

  // Verify the contract on BSCScan
  if (process.env.BSCSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await token.deployTransaction.wait(6);
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [lzEndpoint],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 