const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MFAIToken", function () {
  let MFAIToken;
  let token;
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

    // Set trusted remote using LzApp's function
    const remoteChainId = 1; // destination chain id
    const remoteAndLocal = ethers.utils.solidityPack(
      ['address', 'address'],
      [token.address, token.address] // remote and local address
    );
    await token.setTrustedRemote(remoteChainId, remoteAndLocal);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseEther("50");
      await token.transfer(addr1.address, transferAmount);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("LayerZero", function () {
    it("Should estimate fees correctly", async function () {
      const amount = ethers.utils.parseEther("100");
      const [nativeFee, zroFee] = await token.estimateFee(
        1, // destination chain id
        ethers.utils.defaultAbiCoder.encode(["address"], [addr1.address]),
        amount
      );
      expect(nativeFee).to.be.gt(0);
      expect(zroFee).to.equal(0);
    });

    it("Should send tokens cross-chain", async function () {
      const amount = ethers.utils.parseEther("100");
      const initialBalance = await token.balanceOf(owner.address);
      
      await token.send(
        1, // destination chain id
        ethers.utils.defaultAbiCoder.encode(["address"], [addr1.address]),
        amount,
        { value: ethers.utils.parseEther("0.1") } // sending some ETH for fees
      );

      expect(await token.balanceOf(owner.address)).to.equal(
        initialBalance.sub(amount)
      );
    });
  });
}); 