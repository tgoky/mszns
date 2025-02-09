import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contract with account: ${deployer.address}`);

  const initialTreasury = "0xd9f53DCa4EdACb78E97B5a4A30bC39c7b61EE8ad"; // Replace with a valid treasury address

  const PredictionMarket5 = await ethers.getContractFactory("PredictionMarket6");
  const contract = await PredictionMarket5.deploy(initialTreasury);

  // ✅ Wait for the contract to be deployed
  await contract.waitForDeployment();

  // ✅ Retrieve contract address
  const contractAddress = await contract.getAddress();

  console.log(`PredictionMarket5 deployed at: ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
