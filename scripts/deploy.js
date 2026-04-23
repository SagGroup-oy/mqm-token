const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MQM Token...");
  console.log("Deployer:", deployer.address);
  console.log("Network:", network.name);
  const icoWallet = process.env.ICO_WALLET || deployer.address;
  const teamWallet = process.env.TEAM_WALLET || deployer.address;
  const ecosystemWallet = process.env ECOSYSTEM_WALLET || deployer.address;
  const liquidityWallet = process.env.LIQUIDITY_WALLET || deployer.address;
  const reserveWallet = process.env.RESERVE_WALLET || deployer.address;
  const advisorWallet = process.env.ADVISOR_WALLET || deployer.address;
  const MQMToken = await ethers.getContractFactory("MQMToken");
  const token = await MQMToken.deploy(icoWallet,teamWallet,ecosystemWallet,liquidityWallet,reserveWallet,advisorWallet,deployer.address);
  await token.waitForDeployment();
  const address = await token.getAddress();
  console.log("✅ MQM Token deployed to:", address);
  console.log("Total supply:", ethers.formatEther(await token.totalSupply()), "MQM");
  const fs = require("fs");
  fs.writeFileSync(`deployments/${network.name}.json`,JSON.stringify({network:network.name,address,deployer:deployer.address,timestamp:new Date().toISOString(),txHash:token.deploymentTransaction()?.hash},null,2));
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});