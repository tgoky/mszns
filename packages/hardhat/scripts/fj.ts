import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();

  console.log("Approving SZNS tokens for Burner contract with the account:", deployer);

  // Address of the SZNS token contract
  const sznsTokenAddress = "0xe3c200bC40066F9A61e5cf442b05497D6545d8c2"; // Replace with the actual SZNS token address

  // Address of the Burner contract (already deployed)
  const burnerAddress = "0x96d315cd4Da92e3a17265E9b7486823ce07DD318"; // Replace with the actual Burner contract address

  // Amount of SZNS tokens to approve (3 million tokens)
  const amountToApprove = ethers.parseUnits("3000000", 18); // 3 million SZNS tokens

  // Get the SZNS token contract instance (fully qualified reference to the contract in szns.sol)
  const sznsTokenContract = await ethers.getContractAt("contracts/szns.sol:IERC20", sznsTokenAddress);

  // Step 1: Approve the Burner contract to spend SZNS tokens on behalf of the deployer
  const approvalTx = await sznsTokenContract.approve(burnerAddress, amountToApprove);
  console.log("Approval transaction sent:", approvalTx.hash);
  await approvalTx.wait(); // Wait for the approval to be mined
  console.log("Approval successful!");

  // Log the updated allowance to confirm
  const allowance = await sznsTokenContract.allowance(deployer, burnerAddress);
  console.log("Updated allowance for Burner contract:", allowance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
