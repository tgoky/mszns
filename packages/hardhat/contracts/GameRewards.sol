// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract GameRewardsV1 {
    address public owner;
    IERC20 public muffledToken; // MuffledToken is used for rewards
    uint256 public entryFee; // Fee in native MON token (assumed to be chain native token)
    uint256 public taxRate; // Tax rate in basis points (1% = 100 basis points)

    mapping(address => uint256) public pendingRewards;

    event GameStarted(address indexed player, uint256 amountPaid);
    event TokensClaimed(address indexed player, uint256 amount);
    event ScoreRecorded(address indexed player, uint256 score);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor(address _muffledToken, uint256 _taxRate, uint256 _entryFee) {
        owner = msg.sender;
        muffledToken = IERC20(_muffledToken);
        entryFee = _entryFee; // Entry fee in MON token (native)
        taxRate = _taxRate; // Tax rate in basis points (100 basis points = 1%)
    }

    function setEntryFee(uint256 _fee) external onlyOwner {
        entryFee = _fee;
    }

    function setTaxRate(uint256 _taxRate) external onlyOwner {
        require(_taxRate <= 1000, "Tax rate cannot exceed 10%");
        taxRate = _taxRate;
    }

    function startGame() external payable {
        // Deduct tax from entry fee
        uint256 feeAfterTax = entryFee - (entryFee * taxRate / 10000); 
        
        // Ensure the player has paid the required entry fee in MON (native token)
        require(msg.value == entryFee, "Incorrect entry fee");

        // The entry fee is for covering gas, and we use the native MON token for this
        payable(owner).transfer(msg.value - feeAfterTax); // Tax portion sent to owner

        // Notify that the game started with the adjusted fee
        emit GameStarted(msg.sender, feeAfterTax);
    }

    function handleClaim(address player, uint256 score) external {
        // Record the score if it hasn't been recorded yet
        if (pendingRewards[player] == 0) {
            // Calculate and record the rewards for the player based on the score
            pendingRewards[player] += score * 1e18; // Reward in MuffledToken (1:1 ratio in wei)
            emit ScoreRecorded(player, score);
        }

        // Allow the player to claim their tokens
        uint256 amount = pendingRewards[player];
        require(amount > 0, "No tokens to claim");
        require(muffledToken.balanceOf(address(this)) >= amount, "Not enough Muffled tokens in contract");

        uint256 taxAmount = amount * taxRate / 10000; // Calculate tax on claim
        uint256 amountAfterTax = amount - taxAmount;

        pendingRewards[player] = 0; // Reset rewards after claim
        require(muffledToken.transfer(player, amountAfterTax), "Token transfer failed");

        emit TokensClaimed(player, amountAfterTax);
    }

    // Function to withdraw contract balance (owner only)
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner).transfer(amount);
    }

    function withdrawMuffledTokens(uint256 amount) external onlyOwner {
    require(muffledToken.balanceOf(address(this)) >= amount, "Not enough Muffled tokens");
    require(muffledToken.transfer(owner, amount), "Token transfer failed");
}

}
