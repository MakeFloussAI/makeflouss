const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MFAIStaking", function () {
  let MFAIToken;
  let MFAIStaking;
  let token;
  let staking;
  let owner;
  let addr1;
  let addr2;
  let mockEndpoint;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy mock LayerZero endpoint
    const MockEndpoint = await ethers.getContractFactory("MockEndpoint");
    mockEndpoint = await MockEndpoint.deploy();
    await mockEndpoint.deployed();

    // Deploy token
    MFAIToken = await ethers.getContractFactory("MFAIToken");
    token = await MFAIToken.deploy(mockEndpoint.address);
    await token.deployed();

    // Deploy staking
    MFAIStaking = await ethers.getContractFactory("MFAIStaking");
    staking = await MFAIStaking.deploy(token.address);
    await staking.deployed();

    // Set trusted remote for cross-chain functionality
    const remoteChainId = 1; // destination chain id
    const remoteAndLocal = ethers.utils.solidityPack(
      ['address', 'address'],
      [token.address, token.address] // remote and local address
    );
    await token.setTrustedRemote(remoteChainId, remoteAndLocal);

    // Transfer tokens to staking contract for rewards
    const rewardAmount = ethers.utils.parseEther("1000000");
    await token.transfer(staking.address, rewardAmount);

    // Transfer tokens to addr1 for testing
    const testAmount = ethers.utils.parseEther("1000");
    await token.transfer(addr1.address, testAmount);
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      
      // Approve staking contract
      await token.connect(addr1).approve(staking.address, stakeAmount);
      
      // Stake tokens
      await staking.connect(addr1).stake(stakeAmount);
      
      expect(await staking.balanceOf(addr1.address)).to.equal(stakeAmount);
    });

    it("Should allow users to withdraw tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      
      // Approve and stake
      await token.connect(addr1).approve(staking.address, stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);
      
      // Withdraw
      await staking.connect(addr1).withdraw(stakeAmount);
      
      expect(await staking.balanceOf(addr1.address)).to.equal(0);
      expect(await token.balanceOf(addr1.address)).to.be.gt(ethers.utils.parseEther("900")); // Initial balance minus staked amount plus rewards
    });
  });

  describe("Rewards", function () {
    it("Should calculate rewards correctly", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      
      // Get initial balance
      const initialBalance = await token.balanceOf(addr1.address);
      
      // Approve and stake
      await token.connect(addr1).approve(staking.address, stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");
      
      const earned = await staking.earned(addr1.address);
      expect(earned).to.be.gt(0);
      
      // Claim rewards
      await staking.connect(addr1).getReward();
      
      // Check final balance is greater than initial balance
      const finalBalance = await token.balanceOf(addr1.address);
      expect(finalBalance.sub(initialBalance.sub(stakeAmount))).to.be.gt(0);
    });
  });
}); 