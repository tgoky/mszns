// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IXLR8Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Locker {
    address public owner;
    address public xlr8Token; // Address of the XLR8 token contract
    uint256 public constant MON_REQUIRED = 2 ether; // 2 MON (native currency)
    uint256 public constant REWARD_XLR8 = 340000 * 10**18; // 340,000 XLR8 tokens with 18 decimals

    mapping(address => bool) public hasLocked; // Tracks users who have locked MON
    uint256 public totalLockedMon; // Total MON locked in the contract
    uint256 public totalXlr8Distributed; // Total XLR8 distributed

    event MonLocked(address indexed user, uint256 amount);
    event Xlr8Claimed(address indexed user, uint256 amount);
    event OwnerWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor(address _xlr8Token) {
        owner = msg.sender;
        xlr8Token = _xlr8Token;
    }

    // Lock MON and claim XLR8
    function lockMon() external payable {
        require(msg.value == MON_REQUIRED, "You must send exactly 2 MON to lock");
        require(!hasLocked[msg.sender], "You have already locked MON");
        require(
            IXLR8Token(xlr8Token).balanceOf(address(this)) >= REWARD_XLR8,
            "Insufficient XLR8 tokens in the contract"
        );

        hasLocked[msg.sender] = true;
        totalLockedMon += msg.value;

        emit MonLocked(msg.sender, msg.value);
    }

    // Claim XLR8 tokens after locking MON
    function claimXlr8() external {
        require(hasLocked[msg.sender], "You have not locked MON");
        require(
            IXLR8Token(xlr8Token).balanceOf(address(this)) >= REWARD_XLR8,
            "Insufficient XLR8 tokens in the contract"
        );

        hasLocked[msg.sender] = false;
        totalXlr8Distributed += REWARD_XLR8;

        bool success = IXLR8Token(xlr8Token).transfer(msg.sender, REWARD_XLR8);
        require(success, "XLR8 transfer failed");

        emit Xlr8Claimed(msg.sender, REWARD_XLR8);
    }

    // Owner can withdraw excess MON from the contract
    function withdrawMon(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient MON in the contract");
        payable(owner).transfer(amount);

        emit OwnerWithdrawn(owner, amount);
    }

    // Get the contract's MON balance
    function getContractMonBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Get the contract's XLR8 balance
    function getContractXlr8Balance() external view returns (uint256) {
        return IXLR8Token(xlr8Token).balanceOf(address(this));
    }
}
