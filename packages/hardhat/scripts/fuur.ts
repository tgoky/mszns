import { ethers, deployments, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();
  console.log("Deploying contracts with the account:", deployer);

  // Address of the XLR8 token contract
  const xlr8TokenAddress = "0x5f4a0368Cb7d7A53789ea40248c28E0526172450"; // Replace with the actual address

  // Amount of XLR8 tokens to approve and send (6 million tokens)
  const amountToSend = ethers.parseUnits("10000000", 18);

  // Deploy the Locker3 contract
  const lockerDeployment = await deployments.deploy("Locker3", {
    from: deployer,
    args: [xlr8TokenAddress], // Pass the XLR8 token address to the constructor
    log: true,
  });

  console.log("Locker deployed at:", lockerDeployment.address);

  // Get the deployed contract instance
  const locker = await ethers.getContractAt("Locker3", lockerDeployment.address);

  // Log the owner of the contract
  console.log("Contract owner:", await locker.owner());

  // Log the initial XLR8 token balance of the locker
  let xlr8Balance = await locker.getContractXlr8Balance();
  console.log("Initial XLR8 token balance of the locker:", xlr8Balance.toString());

  // Step 1: Approve the Locker contract to spend 6 million XLR8 tokens
  const tokenContract = await ethers.getContractAt("contracts/xlr8.sol:IERC20", xlr8TokenAddress);
  const approvalTx = await tokenContract.approve(lockerDeployment.address, amountToSend);
  console.log("Approval transaction sent:", approvalTx.hash);
  await approvalTx.wait();
  console.log("Approval successful!");

  // Step 2: Fund the Locker contract with 6 million XLR8 tokens
  const transferTx = await tokenContract.transfer(lockerDeployment.address, amountToSend);
  console.log("Funding transaction sent:", transferTx.hash);
  await transferTx.wait();
  console.log("Funding successful!");

  // Log the updated XLR8 token balance of the locker
  xlr8Balance = await locker.getContractXlr8Balance();
  console.log("Updated XLR8 token balance of the locker:", xlr8Balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
