"use client";
import { useEffect, useState } from "react";

import { ethers } from "ethers";

import lockerABI from "./abi/locker2.json"
import burnerABI from "./abi/burner.json"
import xlr8ABI from "./abi/xlr8.json"
import sznsABI  from "./abi/szns.json"


const lockerAddress = "0x9432EE4b5CD5e7616955506D7451C4e2D1Ce2623";



const getContract = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not found");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(lockerAddress, lockerABI, signer);
};
const seasonData = [
  { id: 1, name: "Spring" },
  { id: 2, name: "Summer" },
  { id: 3, name: "Fall" },
  { id: 4, name: "Winter" },
];

const currentSeasonId = 4; // Corresponds to "Winter"

const PredictionSite = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [countdown, setCountdown] = useState(0); // Time left until season changes
  const [accumulatedSzn, setAccumulatedSzn] = useState(0); // Earned szn tokens
  const [lockedNFTs, setLockedNFTs] = useState(0); // Number of NFTs locked in the current season
  const [xlr8Balance, setXlr8Balance] = useState(0);
  const [burnAmount, setBurnAmount] = useState<number>(0);
; // For tracking transaction status
  const [sznsClaimable, setSznsClaimable] = useState<boolean>(false);  

  const [txStatus, setTxStatus] = useState<string>(""); 
  const [selectedSeasons, setSelectedSeasons] = useState<number | null>(null);// Track the user input for burn amount

  // Simulating the TVL locked for each season
  const lockedTVL: { [key in 'Spring' | 'Summer' | 'Fall' | 'Winter']: number } = {
    Spring: 450,  // Example: 450 NFTs locked in Spring
    Summer: 600,  // Example: 600 NFTs locked in Summer
    Fall: 750,    // Example: 750 NFTs locked in Fall
    Winter: 500   // Example: 500 NFTs locked in Winter
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
const [lockedSeasons, setLockedSeasons] = useState<{ [key: number]: { locked: boolean, amount: number, txHash: string } }>({});

const handleLockMon = async (index: number) => {
  const { monAmount } = boxStates[index];

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contractAddress = lockerAddress; // Your contract address
  const lockerAbi = lockerABI; // Your contract ABI
  const contract = new ethers.Contract(contractAddress, lockerAbi, signer);

  try {
    // Proceed with locking 2 MON
    const lockTx = await contract.lockMon({
      value: ethers.utils.parseEther("2"), // Locking 2 MON (native token)
    });

    alert(`Box ${index + 1}: Transaction in progress, please wait...`);

    // Wait for the transaction to be confirmed
    await lockTx.wait();

    // Update UI after success
    alert(`Box ${index + 1}: 2 MON successfully locked!`);

    setBoxStates((prevState) =>
      prevState.map((box, i) =>
        i === index
          ? { ...box, locked: true, txHash: lockTx.hash }
          : box
      )
    );
  } catch (error) {
    console.error(`Box ${index + 1}: Error locking MON:`, error);
    alert(`Box ${index + 1}: Failed to lock MON. Please try again.`);
  }
};

const handleClaimXlr8 = async (index: number) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contractAddress = lockerAddress; // Your contract address
  const lockerAbi = lockerABI; // Your contract ABI
  const contract = new ethers.Contract(contractAddress, lockerAbi, signer);

  try {
    // Check if the user has already locked MON
    const hasLocked = await contract.hasLocked(await signer.getAddress());

    if (!hasLocked) {
      return alert(`Box ${index + 1}: You must lock MON before claiming XLR8.`);
    }

    // Proceed with claiming XLR8
    const claimTx = await contract.claimXlr8();

    alert(`Box ${index + 1}: Claiming XLR8, please wait...`);

    // Wait for the transaction to be confirmed
    await claimTx.wait();

    // Update UI after success
    alert(`Box ${index + 1}: XLR8 successfully claimed!`);

    // You can add additional logic here if you want to update the UI or state
    setBoxStates((prevState) =>
      prevState.map((box, i) =>
        i === index
          ? { ...box, claimed: true, txHash: claimTx.hash }
          : box
      )
    );
  } catch (error) {
    console.error(`Box ${index + 1}: Error claiming XLR8:`, error);
    alert(`Box ${index + 1}: Failed to claim XLR8. Please try again.`);
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
  }

  
  const [boxStates, setBoxStates] = useState<BoxState[]>(
    seasonData.map(() => ({
      monAmount: 0, // default MON amount for each season
      selectedSeasons: null,
      locked: false, // Initially not locked
      claimed: false
    }))
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
      burnAmountInUnits // Amount of XLR8 the burner contract can spend
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
      burnAmountInUnits // Amount to burn
    );
    await txBurn.wait(); // Wait for burn to complete

    // Mint SZNS tokens (1 SZNS for every 1000 XLR8 burned)
    const sznsAmount = burnAmountInUnits.div(ethers.utils.parseUnits("1000", 18)); // Calculate SZNS amount based on the formula (1000 XLR8 = 1 SZNS)
    const txMint = await sznsContract.mint(signer.getAddress(), sznsAmount);
    await txMint.wait(); // Wait for minting to complete

    setTxStatus(`Successfully burned ${burnAmount} XLR8 and received ${ethers.utils.formatUnits(sznsAmount, 18)} SZNS tokens!`);
  } catch (err) {
    console.error(err);
    setTxStatus("An error occurred while processing your burn transaction.");
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
        <h1
          className="text-6xl font-bold"
          style={{ fontFamily: "'Faster One', sans-serif", color: "navy" }}
        >
          Welcome to Monad Szns
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-row flex-grow mt-24">
  <div className="w-full md:w-1/2 p-6 overflow-hidden">
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
              style={{
                fontFamily: "'Bruno Ace SC', sans-serif",
                color: "navy",
                marginBottom: "8px",
              }}
            >
              Lock in MONAD to Start Accelerating
            </p>
            <p className="font-semibold text-lg mb-2">
              Selected Amount: 2 MON
            </p>

            <button
              onClick={() => handleLockMon(index)}
              className={`px-4 py-2 rounded-lg font-bold w-full max-w-[200px] mb-2 ${boxStates[index].locked ? "bg-gray-400 text-white cursor-not-allowed" : "bg-yellow-400 text-black"}`}
              disabled={boxStates[index].locked} // Disable button when locked
            >
              {boxStates[index].locked ? "LOCKED IN" : "Lock MON"}
            </button>
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
          </div>
       


                {/* Accelerate Bar */}
                <div className="mt-4">
                  <p className="text-sm mb-2">Accelerate Progress</p>
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
          <div className="bg-yellow-500 p-4 rounded-lg shadow-md text-center">

            <div className="mt-6 text-center">
           
            <img src="/monadszns.gif" alt="NFT preview" className="mx-auto w-full max-w-md" />
          </div>
           {/* Mint progress container */}
   
            <button
              onClick={handleStakeXlr8}
              className="mt-4 px-4 py-2 bg-pink-400 rounded-lg text-black font-bold"
            >
              Monad SZN Mint Coming
            </button>
          </div>

            {/* GIF Preview of NFT */}
           

          
          {/* Accelerate Bar */}
        {/* Accelerate Bar */}
{/* Accelerate Bar */}
<div className="mt-6 bg-green-800 p-6 rounded-lg shadow-md text-white text-center">
  <h3 className="text-xl font-bold mb-4">Accelerate Bar</h3>

  {/* Blue containers for xlr8 and szn balances side by side with space between */}
  <div className="mt-4 flex justify-between gap-6 mb-6">
    {/* xlr8 Balance container */}
    <div className="p-4 bg-orange-500 text-white rounded-lg shadow-lg flex-1 ">
      <p className="text-lg font-semibold">accelerate across monad</p>
    </div>

    {/* szn Balance container */}
    <div className="p-4 bg-orange-500 text-white rounded-lg shadow-lg flex-1 ">
      <p className="text-lg font-semibold">SZNS </p>
    </div> 
  </div>

  {/* User Input for Burn Amount */}
  <div className="flex items-center mb-6 ">
    <input
      type="number"
      value={burnAmount}
      onChange={(e) => setBurnAmount(Number(e.target.value))}
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

  <button onClick={handleApproveXlr8} className="px-6 py-3 bg-pink-500 rounded-lg text-black font-bold">Approve </button> 
  <button
            onClick={handleClaimSzn}
            className="px-6 py-3 bg-blue-500 rounded-lg text-white font-bold"
          >
            Claim SZNS
          </button>
          <button
            onClick={handleBurnXlr8ForSzn}
            className="px-6 py-3 bg-blue-500 rounded-lg text-white font-bold"
          >
            burn SZNS
          </button>
          </div>
  

{/* Claim SZNS button */}

      {/* Transaction Status */}
      {txStatus && (
        <div className="mt-4 text-xl font-semibold text-white">
          {txStatus}
        </div>
      )}
    </div>
        </div>
      </div>

  );

};

export default PredictionSite;


