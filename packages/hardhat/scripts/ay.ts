import { ethers, deployments, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();

  console.log("Deploying contracts with the account:", deployer);

  // Address of the XLR8 token contract
  const xlr8TokenAddress = "0x5f4a0368Cb7d7A53789ea40248c28E0526172450"; // Replace with the actual address

  // Address of the SZNS token contract
  const sznsTokenAddress = "0xe3c200bC40066F9A61e5cf442b05497D6545d8c2"; // Replace with the actual SZNS token address

  // Deploy the Burner contract
  const burnerDeployment = await deployments.deploy("Burner2", {
    from: deployer,
    args: [xlr8TokenAddress, sznsTokenAddress], // Pass XLR8 token address and SZNS token address to the constructor
    log: true,
  });

  console.log("Burner contract deployed at:", burnerDeployment.address);

  // Get the deployed contract instance
  const burner = await ethers.getContractAt("Burner2", burnerDeployment.address);

  // Log the owner of the contract
  console.log("Contract owner:", await burner.owner());

  // Log the initial XLR8 token balance of the burner contract
  const xlr8Balance = await burner.getContractXlr8Balance();
  console.log("Initial XLR8 token balance of the burner contract:", xlr8Balance.toString());

  // Log the initial SZNS token balance of the burner contract


  // Amount of XLR8 tokens to approve and send (600,000 XLR8 tokens)
  const amountToSend = ethers.parseUnits("6000000", 18); // 6 million XLR8 tokens

  // Step 1: Approve the Burner contract to spend 6 million XLR8 tokens on behalf of the user
  const tokenContract = await ethers.getContractAt("contracts/xlr8.sol:IERC20", xlr8TokenAddress); // Fully qualified reference to IERC20 from xlr8.sol
  const approvalTx = await tokenContract.approve(burnerDeployment.address, amountToSend);
  console.log("Approval transaction sent:", approvalTx.hash);
  await approvalTx.wait(); // Wait for approval to be mined
  console.log("Approval successful!");

  // Step 2: Fund the Burner contract with 6 million XLR8 tokens
  const transferTx = await tokenContract.transfer(burnerDeployment.address, amountToSend);
  console.log("Funding transaction sent:", transferTx.hash);
  await transferTx.wait(); // Wait for the transfer to be mined
  console.log("Funding successful!");

  // Log the updated XLR8 token balance of the burner contract
  const updatedXlr8Balance = await burner.getContractXlr8Balance();
  console.log("Updated XLR8 token balance of the burner contract:", updatedXlr8Balance.toString());

  // Step 3: Fund the Burner contract with SZNS tokens (You must first fund the contract with SZNS tokens)
  const sznsTokenContract = await ethers.getContractAt("contracts/szns.sol:IERC20", sznsTokenAddress); // Fully qualified reference to IERC20 for SZNS
  const sznsAmountToSend = ethers.parseUnits("1000000", 18); // Example amount (1 million SZNS tokens)

  const sznsApprovalTx = await sznsTokenContract.approve(burnerDeployment.address, sznsAmountToSend);
  console.log("SZNS approval transaction sent:", sznsApprovalTx.hash);
  await sznsApprovalTx.wait(); // Wait for SZNS approval
  console.log("SZNS approval successful!");

  const sznsTransferTx = await sznsTokenContract.transfer(burnerDeployment.address, sznsAmountToSend);
  console.log("SZNS funding transaction sent:", sznsTransferTx.hash);
  await sznsTransferTx.wait(); // Wait for SZNS transfer
  console.log("SZNS funding successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
