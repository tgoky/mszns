import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const muffledTokenAddress = "0x394d1D22994541BD4cbC3E806d846F5D1a6F22F8"; // Replace with actual token address
  const gameRewardsAddress = "0xec035D9603bC3447BA0370F45693744FBcA6363F"; // Replace with deployed GameRewards contract address

  const amountToTransfer = ethers.parseUnits("300000000", 18); // 90 million tokens

  // Get MuffledBird Token contract instance
  const muffledToken = await ethers.getContractAt("contracts/MuffledBirdV1.sol:IERC20", muffledTokenAddress, deployer);

  console.log("Transferring 90 million MuffledBird tokens to GameRewards...");
  const transferTx = await muffledToken.transfer(gameRewardsAddress, amountToTransfer);
  await transferTx.wait();
  console.log("Transfer transaction confirmed ✅");

  console.log("Tokens successfully sent to GameRewards! 🎉");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
