import { ethers } from "hardhat";

type Address = string;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  // Addresses
  const xlr8TokenAddress: Address = "0x0c26e4453da09F1bcc87abc0B2DA65e032aAb848"; // Replace with actual XLR8 token contract address
  const lockerAddress: Address = "0xc1F45D44523482552F86BB9660470a8959422D95"; // Replace with deployed Locker3 address

  // Amount to approve and send (e.g., 6 million XLR8 tokens with 18 decimals)
  const amountToSend = ethers.parseUnits("476100000", 18);

  // Get XLR8 token contract instance
  const xlr8Token = await ethers.getContractAt("contracts/xlr8.sol:IERC20", xlr8TokenAddress);

  // Check deployer's balance
  const deployerBalance = await xlr8Token.balanceOf(deployer.address);
  console.log("Deployer's XLR8 Balance:", ethers.formatUnits(deployerBalance, 18));

  if (deployerBalance < amountToSend) {
    console.error("Insufficient XLR8 balance!");
    return;
  }

  // Approve Locker3 contract to spend XLR8 tokens
  console.log("Approving Locker3 contract...");
  const approveTx = await xlr8Token.approve(lockerAddress, amountToSend);
  await approveTx.wait();
  console.log("Approval successful! Tx Hash:", approveTx.hash);

  // Transfer XLR8 tokens to Locker3 contract
  console.log("Transferring XLR8 tokens to Locker3...");
  const transferTx = await xlr8Token.transfer(lockerAddress, amountToSend);
  await transferTx.wait();
  console.log("Transfer successful! Tx Hash:", transferTx.hash);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
