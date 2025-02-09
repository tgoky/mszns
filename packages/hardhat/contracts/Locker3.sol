// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// interface IXLR8Token {
//     function transfer(address recipient, uint256 amount) external returns (bool);
//     function balanceOf(address account) external view returns (uint256);
// }

// contract Locker3 {
//     address public owner;
//     address public xlr8Token; // Address of the XLR8 token contract
//     uint256 public constant MON_REQUIRED = 2 ether; // 2 MON (native currency)
//     uint256 public constant REWARD_XLR8 = 340000 * 10**18; // 340,000 XLR8 tokens with 18 decimals
//     uint256 public constant LOCK_DURATION = 30 days; // Lock period of 30 days

//     mapping(address => bool) public hasClaimed; // Tracks users who have claimed XLR8
//     mapping(address => uint256) public lockTimestamps; // Tracks when users locked MON
//     uint256 public totalLockedMon; // Total MON locked in the contract
//     uint256 public totalXlr8Distributed; // Total XLR8 distributed

//     event MonLocked(address indexed user, uint256 amount);
//     event Xlr8Claimed(address indexed user, uint256 amount);
//     event MonUnlocked(address indexed user, uint256 amount);
//     event OwnerWithdrawn(address indexed owner, uint256 amount);

//     modifier onlyOwner() {
//         require(msg.sender == owner, "Only the owner can perform this action");
//         _;
//     }

//     constructor(address _xlr8Token) {
//         owner = msg.sender;
//         xlr8Token = _xlr8Token;
//     }

//     // Lock MON and claim eligibility for XLR8
//     function lockMon() external payable {
//         require(msg.value == MON_REQUIRED, "You must send exactly 2 MON to lock");
//         require(lockTimestamps[msg.sender] == 0, "You have already locked MON");
        
//         // Ensure the contract has enough XLR8 tokens for rewards before locking
//         require(
//             IXLR8Token(xlr8Token).balanceOf(address(this)) >= REWARD_XLR8,
//             "Insufficient XLR8 tokens available"
//         );
        
//         // Ensure there is enough MON available for unlocking later
//         require(
//             address(this).balance >= totalLockedMon + MON_REQUIRED,
//             "Not enough MON available for locking"
//         );

//         lockTimestamps[msg.sender] = block.timestamp;
//         totalLockedMon += msg.value;

//         emit MonLocked(msg.sender, msg.value);
//     }

//     // Claim XLR8 tokens after locking MON
//     function claimXlr8() external {
//         require(lockTimestamps[msg.sender] > 0, "You have not locked MON");
//         require(!hasClaimed[msg.sender], "You have already claimed your reward");
//         require(
//             IXLR8Token(xlr8Token).balanceOf(address(this)) >= REWARD_XLR8,
//             "Insufficient XLR8 tokens in the contract"
//         );

//         hasClaimed[msg.sender] = true;
//         totalXlr8Distributed += REWARD_XLR8;

//         bool success = IXLR8Token(xlr8Token).transfer(msg.sender, REWARD_XLR8);
//         require(success, "XLR8 transfer failed");

//         emit Xlr8Claimed(msg.sender, REWARD_XLR8);
//     }

//     // Unlock MON after the lock duration has passed
//     function unlockMon() external {
//         require(lockTimestamps[msg.sender] > 0, "You have not locked MON");
//         require(
//             block.timestamp >= lockTimestamps[msg.sender] + LOCK_DURATION,
//             "Lock duration has not yet passed"
//         );

//         // Update state before transferring MON
//         lockTimestamps[msg.sender] = 0;
//         totalLockedMon -= MON_REQUIRED;

//         // Transfer MON after updating state
//         (bool success, ) = payable(msg.sender).call{value: MON_REQUIRED}("");
//         require(success, "Transfer failed");

//         emit MonUnlocked(msg.sender, MON_REQUIRED);
//     }

//     // Owner can withdraw only excess MON, not users' locked MON
//     function withdrawMon(uint256 amount) external onlyOwner {
//         uint256 excessMon = address(this).balance - totalLockedMon;
//         require(amount <= excessMon, "Cannot withdraw users' locked MON");

//         payable(owner).transfer(amount);
//         emit OwnerWithdrawn(owner, amount);
//     }

//     // Get the contract's MON balance
//     function getContractMonBalance() external view returns (uint256) {
//         return address(this).balance;
//     }

//     // Get the contract's XLR8 balance
//     function getContractXlr8Balance() external view returns (uint256) {
//         return IXLR8Token(xlr8Token).balanceOf(address(this));
//     }

//     // Allow the contract to receive MON safely
//     receive() external payable {}
// }
