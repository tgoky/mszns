"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import burnerABI from "./abi/burner.json";
import lockerABI from "./abi/locker2.json";
import sznsABI from "./abi/szns.json";
import xlr8ABI from "./abi/xlr8.json";
import { ethers } from "ethers";

// const lockerAddress = "0x9432EE4b5CD5e7616955506D7451C4e2D1Ce2623";

const lockerAddress = "0xc1F45D44523482552F86BB9660470a8959422D95";
const getContract = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not found");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(lockerAddress, lockerABI, signer);
};
const seasonData = [
  { id: 1, name: "🌸 Spring" },
  { id: 2, name: "☀️  Summer" },
  { id: 3, name: "🍂 Fall" },
  { id: 4, name: "❄ Winter" },
];

const currentSeasonId = 4; // Corresponds to "Winter"

const PredictionSite = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [countdown, setCountdown] = useState(0); // Time left until season changes
  const [accumulatedSzn, setAccumulatedSzn] = useState(0); // Earned szn tokens
  const [lockedNFTs, setLockedNFTs] = useState(0); // Number of NFTs locked in the current season
  const [xlr8Balance, setXlr8Balance] = useState(0);
  const [burnAmount, setBurnAmount] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // For tracking transaction status
  const [sznsClaimable, setSznsClaimable] = useState<boolean>(false);

  const [txStatus, setTxStatus] = useState<string>("");
  const [selectedSeasons, setSelectedSeasons] = useState<number | null>(null); // Track the user input for burn amount

  // Simulating the TVL locked for each season
  const lockedTVL: { [key in "Spring" | "Summer" | "Fall" | "Winter"]: number } = {
    Spring: 450, // Example: 450 NFTs locked in Spring
    Summer: 600, // Example: 600 NFTs locked in Summer
    Fall: 750, // Example: 750 NFTs locked in Fall
    Winter: 500, // Example: 500 NFTs locked in Winter
  };

  const maxLockedNFTs = 1000; // Define the maximum NFTs locked to 1000 for the "Accelerate" bar

  useEffect(() => {
    try {
      const contractInstance = getContract();
      setContract(contractInstance);

      // Initialize countdown for season change (example: 30 days from now)
      const seasonChangeDate = new Date();
      seasonChangeDate.setDate(seasonChangeDate.getDate() + 30);
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const timeLeft = Math.max(0, seasonChangeDate.getTime() - now);
        setCountdown(Math.floor(timeLeft / 1000)); // Convert milliseconds to seconds
      }, 1000);

      // Set initial locked NFTs for the current season

      return () => clearInterval(interval);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const [monAmount, setMonAmount] = useState<number>(0);
  const [seasons, setSeasons] = useState<number>(1);
  const [lockedSeasons, setLockedSeasons] = useState<{
    [key: number]: { locked: boolean; amount: number; txHash: string };
  }>({});

  const formatTime = (ms: number): string => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${days}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleLockMon = async (index: number) => {
    const { monAmount } = boxStates[index];
    const unlockAfterDays = 21; // Unlock after 34 days
    const unlockTimestamp = Date.now() + unlockAfterDays * 24 * 60 * 60 * 1000;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractAddress = lockerAddress; // Your contract address
    const lockerAbi = lockerABI; // Your contract ABI
    const contract = new ethers.Contract(contractAddress, lockerAbi, signer);

    try {
      const lockTx = await contract.lockMon({
        value: ethers.utils.parseEther("1"), // Locking 2 MON
      });

      // Show modal with transaction in progress
      setModalMessage(` Transaction in progress, please wait...`);
      setModalVisible(true);

      await lockTx.wait();

      // Show modal with success message
      setModalMessage(`1 MON successfully locked! Please Claim your XLR8 tokens. Dont refresh page`);
      setBoxStates(prevState =>
        prevState.map((box, i) =>
          i === index ? { ...box, locked: true, unlockTime: unlockTimestamp, txHash: lockTx.hash } : box,
        ),
      );
    } catch (error) {
      console.error(` Error locking MON:`, error);

      // Show modal with error message
      setModalMessage(` Failed to lock MON. Please try again.`);
    }
  };

  const handleClaimXlr8 = async (index: number) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractAddress = lockerAddress; // Your contract address
    const lockerAbi = lockerABI; // Your contract ABI
    const contract = new ethers.Contract(contractAddress, lockerAbi, signer);

    try {
      const userAddress = await signer.getAddress();

      // Check if the user has a lock timestamp
      const lockTimestamp = await contract.lockTimestamps(userAddress);

      if (lockTimestamp.toNumber() === 0) {
        return alert(`You must lock MON before claiming XLR8.`);
      }

      // Proceed with claiming XLR8
      const claimTx = await contract.claimXlr8();

      setModalMessage(` Claiming XLR8, please wait...`);

      // Wait for the transaction to be confirmed
      await claimTx.wait();

      // Update UI after success

      setModalMessage(`XLR8 successfully claimed!`);

      setBoxStates(prevState =>
        prevState.map((box, i) => (i === index ? { ...box, claimed: true, txHash: claimTx.hash } : box)),
      );
    } catch (error) {
      console.error(`Error claiming XLR8:`, error);
      setModalMessage(`Failed to claim XLR8. Please try again.`);
    }
  };

  // Stake xlr8 to earn szn
  const handleStakeXlr8 = async () => {
    if (!contract) return alert("Contract not loaded");
    try {
      const tx = await contract.stakeXlr8(); // Replace with the actual contract function
      await tx.wait();
      alert("xlr8 staked! Start earning szn.");
    } catch (error) {
      console.error("Error staking xlr8:", error);
    }
  };

  // Calculate the acceleration progress (percentage)
  const calculateAccelerationProgress = () => {
    const progress = (lockedNFTs / maxLockedNFTs) * 100;
    return Math.min(progress, 100); // Ensure it doesn't exceed 100%
  };

  // // Burn xlr8 to revive SZN
  // const handleBurnXlr8ForSzn = async () => {
  //   if (!contract || burnAmount <= 0) return alert("Please enter a valid amount to burn");
  //   try {
  //     const tx = await contract.burnXlr8(burnAmount); // Replace with actual contract method
  //     await tx.wait();
  //     alert(`Successfully burned ${burnAmount} xlr8 for SZN tokens!`);
  //   } catch (error) {
  //     console.error("Error burning xlr8 for SZN:", error);
  //   }
  // };

  // Handle predefined percentage burn amount
  const handlePredefinedBurn = (percentage: number) => {
    const amountToBurn = (percentage / 100) * xlr8Balance;
    setBurnAmount(amountToBurn);
  };

  interface BoxState {
    monAmount: number; // Amount of MON the user wants to lock
    selectedSeasons: null | any; // Replace 'any' with the actual type of selected seasons, if applicable
    locked: boolean; // Whether the box is locked or not
    txHash?: string; // Optional property to store the transaction hash
    claimed: boolean;
    unlockTime: number;
  }

  const [boxStates, setBoxStates] = useState<BoxState[]>(
    seasonData.map(() => ({
      monAmount: 0, // default MON amount for each season
      selectedSeasons: null,
      locked: false, // Initially not locked
      claimed: false,
      unlockTime: 0,
    })),
  );
  // Handle approval of XLR8 tokens (Step 1)
  const handleApproveXlr8 = async () => {
    if (burnAmount <= 0) {
      setTxStatus("Please enter a valid amount to approve.");
      return;
    }

    try {
      // Set up Ethereum provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const xlr8TokenAddress = "0x5f4a0368Cb7d7A53789ea40248c28E0526172450";
      const burnerContractAddress = "0x96d315cd4Da92e3a17265E9b7486823ce07DD318";

      // Create contract instance for XLR8 token
      const xlr8Contract = new ethers.Contract(xlr8TokenAddress, xlr8ABI, signer);

      // Convert burnAmount to 18 decimals
      const burnAmountInUnits = ethers.utils.parseUnits(burnAmount.toString(), 18);

      // Approve the burner contract to transfer XLR8 tokens from user
      const txApproval = await xlr8Contract.approve(
        burnerContractAddress, // Burner contract address
        burnAmountInUnits, // Amount of XLR8 the burner contract can spend
      );
      await txApproval.wait(); // Wait for approval to be confirmed

      setTxStatus(`Approval successful! You can now burn ${burnAmount} XLR8 tokens.`);
    } catch (err) {
      console.error(err);
      setTxStatus("An error occurred while approving XLR8 tokens.");
    }
  };

  // Handle burning XLR8 for SZNS (Step 2)
  const handleBurnXlr8ForSzn = async () => {
    if (burnAmount <= 0) {
      setTxStatus("Please enter a valid amount to burn.");
      return;
    }

    try {
      // Set up Ethereum provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const xlr8TokenAddress = "0x5f4a0368Cb7d7A53789ea40248c28E0526172450";
      const sznsTokenAddress = "0xe3c200bC40066F9A61e5cf442b05497D6545d8c2";
      const burnerContractAddress = "0x96d315cd4Da92e3a17265E9b7486823ce07DD318";

      // Create contract instances for XLR8 and SZNS
      const xlr8Contract = new ethers.Contract(xlr8TokenAddress, xlr8ABI, signer);
      const sznsContract = new ethers.Contract(sznsTokenAddress, sznsABI, signer);

      // Convert burnAmount to 18 decimals
      const burnAmountInUnits = ethers.utils.parseUnits(burnAmount.toString(), 18);

      // Check if approval was done previously
      const allowance = await xlr8Contract.allowance(signer.getAddress(), burnerContractAddress);
      if (allowance.lt(burnAmountInUnits)) {
        setTxStatus("Please approve XLR8 tokens first.");
        return;
      }

      // Burn XLR8 tokens by transferring them to the burner contract
      const txBurn = await xlr8Contract.transferFrom(
        signer.getAddress(), // Sender address (user's address)
        burnerContractAddress, // Burner contract address
        burnAmountInUnits, // Amount to burn
      );
      await txBurn.wait(); // Wait for burn to complete

      // Mint SZNS tokens (1 SZNS for every 1000 XLR8 burned)
      const sznsAmount = burnAmountInUnits.div(ethers.utils.parseUnits("1000", 18)); // Calculate SZNS amount based on the formula (1000 XLR8 = 1 SZNS)
      const txMint = await sznsContract.mint(signer.getAddress(), sznsAmount);
      await txMint.wait(); // Wait for minting to complete

      setTxStatus(
        `Successfully burned ${burnAmount} XLR8 and received ${ethers.utils.formatUnits(sznsAmount, 18)} SZNS tokens!`,
      );
    } catch (err) {
      console.error(err);
      setTxStatus("An error occurred while processing your burn transaction.");
    }
  };

  const UnlockButton = ({ unlockTime, onUnlock }: { unlockTime: number; onUnlock: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<number>(unlockTime - Date.now());
    const isUnlockable = timeLeft <= 0;

    useEffect(() => {
      if (timeLeft > 0) {
        const interval = setInterval(() => {
          setTimeLeft(unlockTime - Date.now());
        }, 1000);

        return () => clearInterval(interval);
      }
    }, [unlockTime, timeLeft]);

    return (
      <button
        onClick={onUnlock}
        disabled={!isUnlockable}
        className={`px-4 py-2 rounded-lg font-bold w-full max-w-[200px] ${
          isUnlockable ? "bg-green-400 text-black" : "bg-gray-400 text-white cursor-not-allowed"
        }`}
      >
        {isUnlockable ? "Unlock MON" : `Unlock Mon in ${formatTime(timeLeft)}`}
      </button>
    );
  };

  const handleUnlockMon = async (index: number) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(lockerAddress, lockerABI, signer);
      const userAddress = await signer.getAddress();

      console.log("Fetching lock timestamp for:", userAddress);

      // Fetch user's lock timestamp from the contract
      const lockTimestamp = await contract.lockTimestamps(userAddress);
      const lockTimeInSeconds = lockTimestamp.toNumber();
      console.log("Lock Timestamp:", lockTimeInSeconds);

      if (lockTimeInSeconds === 0) {
        setModalMessage(`You have not locked any MON`);
        return;
      }

      // Calculate the time left
      const currentTime = Math.floor(Date.now() / 1000);
      const unlockTime = lockTimeInSeconds + 21 * 24 * 60 * 60; // 21 days in seconds
      const timeLeft = unlockTime - currentTime;

      console.log(`Current Time: ${currentTime}, Unlock Time: ${unlockTime}, Time Left: ${timeLeft}`);

      if (timeLeft > 0) {
        // Convert seconds to days, hours, and minutes
        const daysLeft = Math.floor(timeLeft / (24 * 60 * 60));
        const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
        const minutesLeft = Math.floor((timeLeft % (60 * 60)) / 60);

        const message = `Your MON will be available to unlock in ${daysLeft} days, ${hoursLeft} hours, and ${minutesLeft} minutes.`;
        console.log(message);
        setModalMessage(message);
        setModalVisible(true);
        return;
      }

      // If 21 days have passed, allow unlocking
      console.log("Unlocking MON...");
      const unlockTx = await contract.unlockMon();
      console.log("Transaction sent:", unlockTx.hash);
      alert("Unlocking MON, please wait...");

      await unlockTx.wait();
      console.log("Transaction confirmed");

      alert("MON successfully unlocked!");
      setBoxStates(prevState =>
        prevState.map((box, i) => (i === index ? { ...box, locked: false, unlockTime: 0 } : box)),
      );
    } catch (error) {
      console.error("Error unlocking MON:", error);
      alert("Failed to unlock MON. Please try again.");
    }
  };

  // Handle claiming SZNS tokens after burning XLR8
  const handleClaimSzn = async () => {
    const burnerContractAddress = "0x96d315cd4Da92e3a17265E9b7486823ce07DD318"; // Address of the Burner contract

    try {
      // Set up Ethereum provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create a contract instance for the Burner contract
      const burnerContract = new ethers.Contract(burnerContractAddress, burnerABI, signer);

      // Call the claimSZNS function from the Burner contract
      const txClaim = await burnerContract.claimSZNS();
      await txClaim.wait(); // Wait for the claim transaction to be confirmed

      setTxStatus("Successfully claimed SZNS tokens!");
      setSznsClaimable(false); // Reset the claim button state after claiming
    } catch (err) {
      console.error(err);
      setTxStatus("An error occurred while claiming SZNS.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: "url('/sj.png')" }} // Replace with your image path
    >
      {/* Header */}
      <div className="absolute w-full top-0 left-0 text-center py-8 bg-gradient-to-red from-yellow-600 to-pink-500">
        <h1 className="text-6xl font-bold" style={{ fontFamily: "'Faster One', sans-serif", color: "navy" }}>
          Welcome to Monad Szns
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-row flex-grow mt-24">
        <div
          className="w-full md:w-1/2 p-6 overflow-hidden bg-white border-4 border-gray-800 rounded-xl 
                shadow-[8px_8px_0px_0px_#4B5563] hover:shadow-[6px_6px_0px_0px_#4B5563] 
                hover:translate-x-[2px] hover:translate-y-[2px] 
                active:shadow-[4px_4px_0px_0px_#4B5563] active:translate-x-[4px] active:translate-y-[4px] transition-all"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seasonData.map(({ id, name }, index) => (
              <div
                key={id}
                className={`p-4 rounded-lg shadow-md text-center ${
                  boxStates[index].locked ? "bg-blue-500 text-white" : "bg-white text-black"
                }`}
                style={{
                  backgroundImage: "url('/gridc.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "450px",
                }}
              >
                <h2 className="text-xl font-bold mb-2">{name}</h2>
                <div className="bg-pink-200 rounded-lg p-4 mt-4 shadow-lg">
                  <p
                    className="relative text-lg md:text-xl font-bold text-navy mb-2 font-modak uppercase tracking-wide 
               drop-shadow-[3px_3px_0px_#284893] 
               before:absolute before:-top-[1px] before:-left-[1px] before:text-[#566947] before:opacity-80 
               before:content-['Lock_1_MONAD_to_Start_Accelerating'] 
               after:absolute after:top-[1px] after:left-[1px] after:text-[#d7812c] after:opacity-80 
               after:content-['Lock_1_MONAD_to_Start_Accelerating']"
                  >
                    Lock 1 MONAD to Start Accelerating
                  </p>

                  <p className="font-semibold text-lg mb-2">claim $XLR8 tokens </p>

                  <button
                    onClick={() => {
                      handleLockMon(index);
                      setModalMessage(`Transaction in progress, please wait...`);
                      setModalVisible(true);
                    }}
                    className={`px-5 py-2 text-white font-black text-lg rounded-md w-full max-w-[200px] mb-2
    border-4 transition-all
    ${
      boxStates[index].locked
        ? "bg-gray-400 border-gray-600 text-white cursor-not-allowed shadow-none"
        : "bg-[#EC4899] border-[#DB2777] shadow-[6px_6px_0px_0px_#BE185D] hover:shadow-[4px_4px_0px_0px_#BE185D] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#BE185D] active:translate-x-[4px] active:translate-y-[4px]"
    }`}
                    disabled={boxStates[index].locked} // Disable button when locked
                  >
                    {boxStates[index].locked ? "LOCKED IN" : "Lock MON"}
                  </button>

                  {boxStates[index] && (
                    <button
                      onClick={() => handleUnlockMon(index)}
                      className={`px-5 py-2 text-white font-black text-lg rounded-md w-full max-w-[200px] mt-4
      border-4 transition-all
      ${
        Date.now() < boxStates[index].unlockTime
          ? "bg-gray-400 border-gray-600 text-white cursor-not-allowed shadow-none"
          : "bg-red-400 border-red-600 shadow-[6px_6px_0px_0px_#B91C1C] hover:shadow-[4px_4px_0px_0px_#B91C1C] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#B91C1C] active:translate-x-[4px] active:translate-y-[4px]"
      }`}
                      disabled={Date.now() < boxStates[index].unlockTime}
                    >
                      {Date.now() < boxStates[index].unlockTime
                        ? `Unlock MON in ${formatTime(boxStates[index].unlockTime - Date.now())}`
                        : "Unlock MON"}
                    </button>
                  )}

                  <Modal isOpen={modalVisible} message={modalMessage} onClose={() => setModalVisible(false)} />

                  {boxStates[index].locked && !boxStates[index].claimed && (
                    <button
                      onClick={() => handleClaimXlr8(index)}
                      className="px-4 py-2 bg-green-400 rounded-lg text-black font-bold w-full max-w-[200px] mt-4"
                    >
                      Claim XLR8
                    </button>
                  )}

                  {boxStates[index].claimed && (
                    <button
                      className="px-4 py-2 bg-gray-400 rounded-lg text-white font-bold w-full max-w-[200px] mt-4 cursor-not-allowed"
                      disabled
                    >
                      XLR8 CLAIMED
                    </button>
                  )}
                  {/* Unstake MON Button */}
                </div>

                {/* Accelerate Bar */}
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200">
                          {Math.round(calculateAccelerationProgress())}%
                        </span>
                      </div>
                    </div>
                    <div className="flex mb-2">
                      <div className="w-full bg-gray-200 rounded-full">
                        <div
                          className="bg-pink-500 text-xs font-semibold text-white text-center p-0.5 leading-none rounded-full"
                          style={{ width: `${calculateAccelerationProgress()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-1 border-l-2 border-gray-800"></div>

        {/* Right Side */}
        <div className="w-1/2 p-4">
          <div
            className="bg-yellow-500 p-4 rounded-lg border-4 border-yellow-700 shadow-[6px_6px_0px_0px_#B45309] 
                hover:shadow-[4px_4px_0px_0px_#B45309] hover:translate-x-[2px] hover:translate-y-[2px] 
                active:shadow-[2px_2px_0px_0px_#B45309] active:translate-x-[4px] active:translate-y-[4px] 
                text-center font-bold text-black transition-all"
          >
            <div className="mt-6 text-center">
              <img src="/monadszns.gif" alt="NFT preview" className="mx-auto w-full max-w-md" />
            </div>
            {/* Mint progress container */}
            <br></br>

            <button
              onClick={handleStakeXlr8}
              className="  px-5 py-2 bg-[#b6eb25] text-white font-bold text-lg rounded-xl
  border-4 border-[#b2e032]
  shadow-[0_0_10px_#66b049] hover:shadow-[0_0_20px_#60A5FA]
  transition-all animate-pulse"
            >
              Monad SZN Mint Coming
            </button>
          </div>

          {/* GIF Preview of NFT */}

          {/* Accelerate Bar */}
          {/* Accelerate Bar */}
          {/* Accelerate Bar */}
          <div
            className="mt-6 bg-green-800 p-6 rounded-lg border-4 border-green-900 shadow-[6px_6px_0px_0px_#065F46] 
                hover:shadow-[4px_4px_0px_0px_#065F46] hover:translate-x-[2px] hover:translate-y-[2px] 
                active:shadow-[2px_2px_0px_0px_#065F46] active:translate-x-[4px] active:translate-y-[4px] 
                text-white text-center font-bold transition-all"
          >
            <h3 className="text-xl font-bold mb-4">Accelerate Bar</h3>

            {/* Blue containers for xlr8 and szn balances side by side with space between */}
            <div className="mt-4 flex justify-between gap-6 mb-6">
              {/* xlr8 Balance container */}
              <div className="p-4 bg-orange-500 text-white rounded-lg shadow-lg flex-1 ">
                <p className="text-lg font-extrabold text-white relative uppercase tracking-wide">
                  <span className="absolute top-[2px] left-[2px] text-black opacity-80">accelerate across monad</span>
                  <span className="absolute top-[4px] left-[4px] text-gray-700 opacity-60">
                    accelerate across monad
                  </span>
                  <span className="absolute top-[6px] left-[6px] text-gray-500 opacity-40">
                    accelerate across monad
                  </span>
                  accelerate across monad
                </p>
              </div>

              {/* szn Balance container */}
              <div className="p-4 bg-orange-500 text-white rounded-lg shadow-lg flex-1 ">
                <p className="text-lg font-extrabold text-white relative uppercase tracking-wide">
                  <span className="absolute top-[2px] left-[2px] text-black opacity-80">accelerate across monad</span>
                  <span className="absolute top-[4px] left-[4px] text-gray-700 opacity-60">
                    accelerate across monad
                  </span>
                  <span className="absolute top-[6px] left-[6px] text-gray-500 opacity-40">
                    accelerate across monad
                  </span>
                  accelerate across monad
                </p>
              </div>
            </div>

            {/* User Input for Burn Amount */}
            <div className="flex items-center mb-6 ">
              <input
                type="number"
                value={burnAmount}
                onChange={e => setBurnAmount(Number(e.target.value))}
                className="w-3/5 px-4 py-2 bg-white text-black rounded-lg mr-4"
                placeholder="Enter amount of xlr8 to burn"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePredefinedBurn(25)}
                  className="px-4 py-2 bg-orange-400 text-white rounded-lg"
                >
                  25%
                </button>
                <button
                  onClick={() => handlePredefinedBurn(50)}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg"
                >
                  50%
                </button>
                <button
                  onClick={() => handlePredefinedBurn(75)}
                  className="px-4 py-2 bg-pink-400 text-white rounded-lg"
                >
                  75%
                </button>
                <button
                  onClick={() => handlePredefinedBurn(100)}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg"
                >
                  100%
                </button>
              </div>
            </div>
            <button
              onClick={handleApproveXlr8}
              className="px-6 py-3 bg-pink-500 text-black font-black text-lg rounded-lg border-4 border-pink-700 shadow-[6px_6px_0px_0px_#BE185D] 
             hover:shadow-[4px_4px_0px_0px_#BE185D] hover:translate-x-[2px] hover:translate-y-[2px] 
             active:shadow-[2px_2px_0px_0px_#BE185D] active:translate-x-[4px] active:translate-y-[4px] transition-all"
            >
              Approve XLR8 ...
            </button>

            <button
              onClick={handleBurnXlr8ForSzn}
              className="px-6 py-3 bg-blue-500 text-white font-black text-lg rounded-lg border-4 border-blue-700 shadow-[6px_6px_0px_0px_#1E3A8A] 
             hover:shadow-[4px_4px_0px_0px_#1E3A8A] hover:translate-x-[2px] hover:translate-y-[2px] 
             active:shadow-[2px_2px_0px_0px_#1E3A8A] active:translate-x-[4px] active:translate-y-[4px] transition-all"
            >
              SZNS (coming soon)
            </button>
          </div>

          {/* Claim SZNS button */}

          {/* Transaction Status */}
          {txStatus && <div className="mt-4 text-xl font-semibold text-white">{txStatus}</div>}
        </div>
      </div>
    </div>
  );
};

export default PredictionSite;
