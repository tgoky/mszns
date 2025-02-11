import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();

  console.log("Deploying the contract with the account:", deployer.address);

  // Define the total supply (in wei)
  const totalSupply = ethers.parseEther("9990000000"); // 1,000,000 SZNS tokens

  // Compile and deploy the contract with _totalSupply
  const XLR8 = await ethers.getContractFactory("MuffledBirdV1");
  const xlr8 = await XLR8.deploy(totalSupply);

  // Wait for deployment to be mined
  await xlr8.deploymentTransaction();
  console.log("MB contract deployed at:", await xlr8.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
