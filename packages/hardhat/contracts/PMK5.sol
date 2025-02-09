

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PredictionMarketTestnetV1 {

    struct Prediction {
        uint256 id;
        string title;
        string category;
        uint256 yesVotes;
        uint256 noVotes;
        bool resolved;
        string result; // "yes" or "no"
    }

    struct Bet {
        uint256 amount;
        string vote; // "yes" or "no"
    }

    uint256 public predictionCount;
    address public owner;
    address public treasury; // Treasury address to receive the fees
    uint256 public excessFunds; // Tracks leftover funds from previous predictions


    bool private locked; // Reentrancy lock

    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    mapping(uint256 => Prediction) public predictions;
    mapping(address => mapping(uint256 => Bet)) public userBets; // User bets for each prediction
    mapping(address => uint256) public balances; // User balances for payouts

    // Events
    event PredictionCreated(uint256 id, string title, string category);
    event BetPlaced(address indexed user, uint256 predictionId, string vote, uint256 amount);
    event PredictionResolved(uint256 predictionId, string result);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event ExcessFundsHandled(string action, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyOpenPrediction(uint256 predictionId) {
        require(!predictions[predictionId].resolved, "Prediction already resolved");
        _;
    }

    constructor(address _initialTreasury) {
        owner = msg.sender;
        treasury = _initialTreasury;
    }

    // Create a new prediction
    function createPrediction(string memory _title, string memory _category) external onlyOwner {
        predictionCount++;

        predictions[predictionCount] = Prediction({
            id: predictionCount,
            title: _title,
            category: _category,
            yesVotes: 0,
            noVotes: 0,
            resolved: false,
            result: ""
        });

        emit PredictionCreated(predictionCount, _title, _category);
    }

    // Place a bet on a prediction (either "yes" or "no")
    function placeBet(uint256 predictionId, string memory vote) external payable onlyOpenPrediction(predictionId) {
        require(msg.value > 0, "Bet amount must be greater than zero");
        require(
            keccak256(bytes(vote)) == keccak256(bytes("yes")) ||
                keccak256(bytes(vote)) == keccak256(bytes("no")),
            "Invalid vote"
        );

        Bet storage userBet = userBets[msg.sender][predictionId];
        require(userBet.amount == 0, "Already placed a bet on this prediction");

        uint256 fee = (msg.value * 1) / 100;
        payable(treasury).transfer(fee);

        uint256 remainingBetAmount = msg.value - fee;

        if (keccak256(bytes(vote)) == keccak256(bytes("yes"))) {
            predictions[predictionId].yesVotes += remainingBetAmount;
        } else {
            predictions[predictionId].noVotes += remainingBetAmount;
        }

        userBet.amount = remainingBetAmount;
        userBet.vote = vote;

        emit BetPlaced(msg.sender, predictionId, vote, remainingBetAmount);
    }

    // Resolve the prediction (must be called after the event happens)
    function resolvePrediction(uint256 predictionId, string memory result) external onlyOwner {
        require(!predictions[predictionId].resolved, "Prediction already resolved");
        require(
            keccak256(bytes(result)) == keccak256(bytes("yes")) ||
                keccak256(bytes(result)) == keccak256(bytes("no")),
            "Invalid result"
        );

        Prediction storage prediction = predictions[predictionId];
        prediction.resolved = true;
        prediction.result = result;

        uint256 totalPool = prediction.yesVotes + prediction.noVotes;
        uint256 winningPool = keccak256(bytes(result)) == keccak256(bytes("yes"))
            ? prediction.yesVotes
            : prediction.noVotes;

        // Excess funds are the losing side's bets
        excessFunds += totalPool - winningPool;

        emit PredictionResolved(predictionId, result);
    }

  function claimPayout(uint256 predictionId) external noReentrant {
        Prediction storage prediction = predictions[predictionId];
        require(prediction.resolved, "Prediction not resolved");

        Bet storage userBet = userBets[msg.sender][predictionId];
        require(userBet.amount > 0, "No bet placed");

        uint256 payout = 0;
        if (keccak256(bytes(userBet.vote)) == keccak256(bytes(prediction.result))) {
            uint256 totalWinningPool = keccak256(bytes(prediction.result)) == keccak256(bytes("yes"))
                ? prediction.yesVotes
                : prediction.noVotes;
            payout = (userBet.amount * (prediction.yesVotes + prediction.noVotes)) / totalWinningPool;
        }

        require(payout > 0, "No payout due");

        // **Update state before transfer to prevent reentrancy**
        userBet.amount = 0;
        userBet.vote = "";
        balances[msg.sender] += payout;

        // **Use call() instead of transfer() to prevent gas limit issues**
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");
    }




    // Handle excess funds (withdraw, burn, or boost)
    function handleExcessFunds(string memory action) external onlyOwner {
        require(excessFunds > 0, "No excess funds available");

        if (keccak256(bytes(action)) == keccak256(bytes("withdraw"))) {
            uint256 amount = excessFunds;
            excessFunds = 0;
            payable(owner).transfer(amount);
            emit ExcessFundsHandled("withdraw", amount);
        } else if (keccak256(bytes(action)) == keccak256(bytes("burn"))) {
            excessFunds = 0;
            emit ExcessFundsHandled("burn", 0);
        } else {
            revert("Invalid action");
        }
    }

    // Function to get contract's balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
