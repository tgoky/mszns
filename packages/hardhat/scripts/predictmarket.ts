import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const initialTreasury = "0xd9f53DCa4EdACb78E97B5a4A30bC39c7b61EE8ad"; // Replace with your treasury address
  const PredictionMarket10 = await ethers.getContractFactory("PredictionMarket10");

  const contract = await PredictionMarket10.deploy(initialTreasury);
  console.log("Transaction sent. Waiting for deployment...");

  const tx = contract.deploymentTransaction();

  // ✅ Handle null case
  if (!tx) {
    console.error("❌ Deployment transaction not found. Contract may not be deploying correctly.");
    return;
  }

  console.log("Transaction hash:", tx.hash); // ✅ Log transaction hash
  await tx.wait(); // ✅ Wait for confirmation

  console.log(`PredictionMarket10 deployed at: ${await contract.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
