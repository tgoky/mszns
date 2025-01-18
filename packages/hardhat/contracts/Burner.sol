// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IXLR8Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ISZNS {
    function mint(address to, uint256 amount) external returns (bool);
}

contract Burner {
    address public owner;
    address public xlr8Token; // Address of the XLR8 token contract
    address public sznsToken; // Address of the SZNS token contract

    uint256 public constant BURN_RATE = 1000 * 10**18; // 1000 XLR8 tokens = 1 SZNS token (18 decimals)

    event TokensBurned(address indexed user, uint256 xlr8Amount, uint256 sznsAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor(address _xlr8Token, address _sznsToken) {
        owner = msg.sender;
        xlr8Token = _xlr8Token;
        sznsToken = _sznsToken;
    }

    // Burn XLR8 tokens and mint SZNS tokens for the user
    function burnXlr8(uint256 xlr8Amount) external {
        require(xlr8Amount >= BURN_RATE, "Insufficient XLR8 tokens to burn");

        uint256 sznsAmount = xlr8Amount / BURN_RATE;

        // Transfer XLR8 tokens from user to this contract
        bool success = IXLR8Token(xlr8Token).transferFrom(msg.sender, address(this), xlr8Amount);
        require(success, "XLR8 transfer failed");

        // Mint SZNS tokens to the user
        bool minted = ISZNS(sznsToken).mint(msg.sender, sznsAmount);
        require(minted, "SZNS minting failed");

        emit TokensBurned(msg.sender, xlr8Amount, sznsAmount);
    }

    // Allow the owner to withdraw any XLR8 tokens in the contract
    function withdrawXlr8(uint256 amount) external onlyOwner {
        bool success = IXLR8Token(xlr8Token).transfer(msg.sender, amount);
        require(success, "XLR8 withdrawal failed");
    }

    // Get the contract's XLR8 token balance
    function getContractXlr8Balance() external view returns (uint256) {
        return IXLR8Token(xlr8Token).balanceOf(address(this));
    }
}