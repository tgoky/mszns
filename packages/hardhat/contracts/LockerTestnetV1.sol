// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IXLR8Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract LockerTestnetV1 {
    address public owner;
    address public xlr8Token;
    uint256 public monRequired;
    uint256 public rewardXlr8;
    uint256 public lockDuration;
    uint256 public feePercentage; // Fee percentage (e.g., 3 for 3%)

    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public lockTimestamps;
    uint256 public totalLockedMon;
    uint256 public totalXlr8Distributed;

    event MonLocked(address indexed user, uint256 amount, uint256 fee);
    event Xlr8Claimed(address indexed user, uint256 amount, uint256 fee);
    event MonUnlocked(address indexed user, uint256 amount);
    event OwnerWithdrawn(address indexed owner, uint256 amount);
    event ParametersUpdated(uint256 monRequired, uint256 rewardXlr8, uint256 lockDuration, uint256 feePercentage);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor(address _xlr8Token, uint256 _monRequired, uint256 _rewardXlr8, uint256 _lockDuration, uint256 _feePercentage) {
        owner = msg.sender;
        xlr8Token = _xlr8Token;
        monRequired = _monRequired;
        rewardXlr8 = _rewardXlr8;
        lockDuration = _lockDuration;
        feePercentage = _feePercentage;
    }

    function lockMon() external payable {
        require(msg.value == monRequired, "Incorrect MON amount sent");
        require(lockTimestamps[msg.sender] == 0, "You have already locked MON");
        require(IXLR8Token(xlr8Token).balanceOf(address(this)) >= rewardXlr8, "Insufficient XLR8 tokens available");
        require(address(this).balance >= totalLockedMon + monRequired, "Not enough MON available for locking");
        
        uint256 fee = (monRequired * feePercentage) / 100;
        uint256 netMon = monRequired - fee;
        
        lockTimestamps[msg.sender] = block.timestamp;
        totalLockedMon += netMon;
        
        emit MonLocked(msg.sender, netMon, fee);
    }

    function claimXlr8() external {
        require(lockTimestamps[msg.sender] > 0, "You have not locked MON");
        require(!hasClaimed[msg.sender], "You have already claimed your reward");
        require(IXLR8Token(xlr8Token).balanceOf(address(this)) >= rewardXlr8, "Insufficient XLR8 tokens in the contract");
        
        uint256 fee = (rewardXlr8 * feePercentage) / 100;
        uint256 netReward = rewardXlr8 - fee;
        
        hasClaimed[msg.sender] = true;
        totalXlr8Distributed += netReward;
        
        bool success = IXLR8Token(xlr8Token).transfer(msg.sender, netReward);
        require(success, "XLR8 transfer failed");
        
        emit Xlr8Claimed(msg.sender, netReward, fee);
    }

    function unlockMon() external {
        require(lockTimestamps[msg.sender] > 0, "You have not locked MON");
        require(block.timestamp >= lockTimestamps[msg.sender] + lockDuration, "Lock duration has not yet passed");
        
        uint256 amount = monRequired - (monRequired * feePercentage) / 100;
        lockTimestamps[msg.sender] = 0;
        totalLockedMon -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit MonUnlocked(msg.sender, amount);
    }

    function updateParameters(uint256 _monRequired, uint256 _rewardXlr8, uint256 _lockDuration, uint256 _feePercentage) external onlyOwner {
        monRequired = _monRequired;
        rewardXlr8 = _rewardXlr8;
        lockDuration = _lockDuration;
        feePercentage = _feePercentage;
        
        emit ParametersUpdated(_monRequired, _rewardXlr8, _lockDuration, _feePercentage);
    }

    function withdrawMon(uint256 amount) external onlyOwner {
        uint256 excessMon = address(this).balance - totalLockedMon;
        require(amount <= excessMon, "Cannot withdraw users' locked MON");
        
        payable(owner).transfer(amount);
        emit OwnerWithdrawn(owner, amount);
    }

    function emergencyWithdrawXlr8(uint256 amount) external onlyOwner {
        require(IXLR8Token(xlr8Token).balanceOf(address(this)) >= amount, "Insufficient XLR8 balance");
        bool success = IXLR8Token(xlr8Token).transfer(owner, amount);
        require(success, "XLR8 transfer failed");
    }

    function getContractMonBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getContractXlr8Balance() external view returns (uint256) {
        return IXLR8Token(xlr8Token).balanceOf(address(this));
    }

    receive() external payable {}
}
