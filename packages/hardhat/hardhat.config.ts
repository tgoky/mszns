import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "@openzeppelin/hardhat-upgrades";

// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "77517a665f3684236594dfae11a86316e7197edbd573e83ade8753b81b21b148";

// If not set, it uses ours Etherscan default API key.
// const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

// forking rpc url
const forkingURL = process.env.FORKING_URL || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
      {
        version: "0.5.0", // Specify the Solidity version 0.7.6
        settings: {
          optimizer: {
            enabled: true, // Enable optimizer
            runs: 200, // Set optimizer runs (for gas efficiency)
          },
        },
      },
      {
        version: "0.5.16", // Specify the Solidity version 0.7.6
        settings: {
          optimizer: {
            enabled: true, // Enable optimizer
            runs: 200, // Set optimizer runs (for gas efficiency)
          },
        },
      },
      {
        version: "0.8.22", // Specify the Solidity version 0.7.6
        settings: {
          optimizer: {
            enabled: true, // Enable optimizer
            runs: 200, // Set optimizer runs (for gas efficiency)
          },
        },
      },
    ],
  },
  defaultNetwork: "monadDevnet",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: forkingURL,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    monadDevnet: {
      url: process.env.MONAD_RPC_URL,
      accounts: [deployerPrivateKey],
      chainId: Number(process.env.MONAD_CHAIN_ID),
    },
  },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: "DUMMY_VALUE_FOR_BLOCKSCOUT", // Or use your actual BlockScout API key if available
    customChains: [
      {
        network: "monadDevnet",
        chainId: 10143,
        urls: {
          browserURL: process.env.MONAD_EXPLORER_URL ?? "", // Correct explorer URL
          apiURL: process.env.MONAD_EXPLORER_URL ? `${process.env.MONAD_EXPLORER_URL}/api` : "", // Ensure a valid API URL is available, or leave empty
        },
      },
    ],
  },

  sourcify: {
    enabled: false,
  },
};

export default config;
