const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("MQMToken", function() {
  let token;
  let owner,ico,team,ecosystem,liquidity,reserve,advisor,user;
  const MAX_SUPPLY = ethers.parseEther("10000000000");
  beforeEach(async function() {
    [owner,ico,team,ecosystem,liquidity,reserve,advisor,user] = await ethers.getSigners();
    const MQMToken = await ethers.getContractFactory("MQMToken");
    token = await MQMToken.deploy(ico.address,team.address,ecosystem.address,liquidity.address,reserve.address,advisor.address,owner.address);
    await token.waitForDeployment();
  });
  describe("Supply", function() {
    it("Total supply equals 10B", async function() { expect(await token.totalSupply()).to.equal(MAX_SUPPLY); });
    it("Token name is MQM Token", async function() { expect(await token.name()).to.equal("MQM Token"); });
    it("Token symbol is MQM", async function() { expect(await token.symbol()).to.equal("MQM"); });
    it("Decimals is 18", async function() { expect(await token.decimals()).to.equal(18); });
  });
  describe("Allocations", function() {
    it("ICO 33.5%", async function() { expect(await token.balanceOf(ico.address)).to.equal(ethers.parseEther("3350000000")); });
    it("Team 25%", async function() { expect(await token.balanceOf(team.address)).to.equal(ethers.parseEther("2500000000")); });
    it("Ecosystem 15%", async function() { expect(await token.balanceOf(ecosystem.address)).to.equal(ethers.parseEther("1500000000")); });
    it("Liquidity 10%", async function() { expect(await token.balanceOf(liquidity.address)).to.equal(ethers.parseEther("1000000000")); });
    it("Reserve 6.5%", async function() { expect(await token.balanceOf(reserve.address)).to.equal(ethers.parseEther("650000000")); });
    it("Advisors 10%", async function() { expect(await token.balanceOf(advisor.address)).to.equal(ethers.parseEther("1000000000")); });
    it("Sum = 10B", async function() {
      const balances = await Promise.all([token.balanceOf(ico.address),token.balanceOf(team.address),token.balanceOf(ecosystem.address),token.balanceOf(liquidity.address),token.balanceOf(reserve.address),token.balanceOf(advisor.address)]);
      expect(balances.reduce((a,b)=>a+b,0n)).to.equal(MAX_SUPPLY);
    });
  });
  describe("Transfers", function() {
    it("transfer works", async function() {
      const amount = ethers.parseEther("1000");
      await token.connect(ico).transfer(user.address,amount);
      expect(await token.balanceOf(user.address)).to.equal(amount);
    });
    it("cannot overspend", async function() { await expect(token.connect(user).transfer(ico.address,ethers.parseEther("9999999999999"))).to.be.reverted; });
  });
  describe("Burn", function() {
    it("burn reduces supply", async function() {
      const amt = ethers.parseEther("1000000");
      const before = await token.balanceOf(ico.address);
      await token.connect(ico).burn(amt);
      expect(await token.balanceOf(ico.address)).to.equal(before-amt);
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY-amt);
    });
  });
  describe("Pause", function() {
    it("owner can pause", async function() { await token.connect(owner).pause(); expect(await token.paused()).to.equal(true); });
    it("transfer fails when paused", async function() { await token.connect(owner).pause(); await expect(token.connect(ico).transfer(user.address,ethers.parseEther("100"))).to.be.reverted; });
    it("owner can unpause", async function() { await token.connect(owner).pause(); await token.connect(owner).unpause(); expect(await token.paused()).to.equal(false); });
    it("non-owner cannot pause", async function() { await expect(token.connect(user).pause()).to.be.reverted; });
  });
  describe("Ownership", function() {
    it("owner set correctly", async function() { expect(await token.owner()).to.equal(owner.address); });
    it("non-owner cannot pause", async function() { await expect(token.connect(user).pause()).to.be.reverted; });
  });
});
