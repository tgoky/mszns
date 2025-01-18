// Import Hardhat environment
import { ethers } from "hardhat";

async function main() {
    // Get the deployer's account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Define token addresses (replace with actual deployed addresses)
    const xlr8TokenAddress = "0x5f4a0368Cb7d7A53789ea40248c28E0526172450"; // Replace with the actual XLR8 token address
    const sznsTokenAddress = "0xe3c200bC40066F9A61e5cf442b05497D6545d8c2"; // Replace with the actual SZNS token address

    
    // Ensure the addresses are valid
    if (!ethers.isAddress(xlr8TokenAddress)) {
        throw new Error(`Invalid XLR8 token address: ${xlr8TokenAddress}`);
    }
    if (!ethers.isAddress(sznsTokenAddress)) {
        throw new Error(`Invalid SZNS token address: ${sznsTokenAddress}`);
    }

    console.log("Using the following token addresses:");
    console.log("XLR8 Token Address:", xlr8TokenAddress);
    console.log("SZNS Token Address:", sznsTokenAddress);

    // Get the contract factory for the TokenLocker
    const TokenLocker = await ethers.getContractFactory("TokenLocker");

    // Deploy the TokenLocker contract
    const tokenLocker = await TokenLocker.deploy(
        xlr8TokenAddress, // XLR8 token address
        sznsTokenAddress  // SZNS token address
    );

    // Wait for the contract to be deployed
    await tokenLocker.deploymentTransaction();


}

// Run the main function and handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    });
