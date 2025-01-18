import { ethers, deployments, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();

  console.log("Deploying contracts with the account:", deployer);

  // Address of the XLR8 token contract
  const xlr8TokenAddress = "0x5f4a0368Cb7d7A53789ea40248c28E0526172450"; // Replace with the actual address

  // Deploy the Locker contract
  const lockerDeployment = await deployments.deploy("Locker", {
    from: deployer,
    args: [xlr8TokenAddress], // Pass the XLR8 token address to the constructor
    log: true,
  });

  console.log("Locker deployed at:", lockerDeployment.address);

  // Get the deployed contract instance
  const locker = await ethers.getContractAt("Locker", lockerDeployment.address);

  // Log the owner of the contract
  console.log("Contract owner:", await locker.owner());

  // Log the initial XLR8 token balance of the contract
  const xlr8Balance = await locker.getContractXlr8Balance();
  console.log("Initial XLR8 token balance of the locker:", xlr8Balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });