import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying PredictionMarketUpgradeable...");

  // Use Hardhat's ethers to get the contract factory
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket4");

  const initialTreasury = "0xd9f53DCa4EdACb78E97B5a4A30bC39c7b61EE8ad"; // Replace with actual treasury address
  const predictionMarket = await upgrades.deployProxy(PredictionMarket, [initialTreasury], {
    initializer: "initialize",
  });

  await predictionMarket.waitForDeployment();
  console.log(`Proxy deployed to: ${await predictionMarket.getAddress()}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
