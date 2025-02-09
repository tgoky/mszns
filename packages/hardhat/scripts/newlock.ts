import { ethers, deployments, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();

  console.log("Deploying contracts with the account:", deployer);

  // Address of the XLR8 token contract
  const xlr8TokenAddress = "0x0c26e4453da09F1bcc87abc0B2DA65e032aAb848"; // Replace with actual address

  // Parameters for the Locker3 contract
  const monRequired = ethers.parseEther("1"); // Adjust this value as needed
  const rewardXlr8 = ethers.parseEther("143000"); // Adjust this value as needed
  const lockDuration = 21 * 24 * 60 * 60; // 21 days in seconds
  const feePercentage = 3;

  // Deploy the Locker contract
  const lockerDeployment = await deployments.deploy("LockerTestnetV1", {
    from: deployer,
    args: [xlr8TokenAddress, monRequired, rewardXlr8, lockDuration, feePercentage], // Pass correct arguments
    log: true,
  });

  console.log("Locker deployed at:", lockerDeployment.address);

  // Get the deployed contract instance
  const locker = await ethers.getContractAt("LockerTestnetV1", lockerDeployment.address);

  // Log the owner of the contract
  console.log("Contract owner:", await locker.owner());

  // Log the initial XLR8 token balance of the contract
  const xlr8Balance = await locker.getContractXlr8Balance();
  console.log("Initial XLR8 token balance of the locker:", xlr8Balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
