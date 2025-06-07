// SPDX-License-Identifier : MIT
pragma solidity ^0.8.29;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ProposalContract is ReentrancyGuard {
    struct Proposal {
        address proposer;
        uint256 proposal_id;
        bool is_proposal_active;
        address target;
        uint256 min_amount;
        uint256 max_amount;
        uint256 investor_share; // in percentage
    }

    event Invested(address investor, uint256 amount);
    event ProposalExecuted(address target, uint256 amount);

    // Proposal configuration and state
    uint256 public proposal_id;
    bool public is_proposal_active;
    address public target;
    uint256 public min_amount;
    uint256 public max_amount;
    uint256 public investor_share;
    uint256 public amt;
    address public proposer;
    uint256 public executionTime;
uint256 public cooldown = 1 minutes;

    mapping(address => uint256) public investors_to_amt;
    address[] public investors;

    constructor(Proposal memory _proposal) {
        proposer = _proposal.proposer;
        proposal_id = _proposal.proposal_id;
        is_proposal_active = _proposal.is_proposal_active;
        min_amount = _proposal.min_amount;
        max_amount = _proposal.max_amount;
        target = _proposal.target;
        investor_share = _proposal.investor_share;
    }

    // Modifier naming
    modifier onlyProposer() {
        require(msg.sender == proposer, "Only proposer can call this function");
        _;
    }

    // invest with nonReentrant to prevent reentrancy attacks
    function invest() public payable nonReentrant {
        require(is_proposal_active, "Proposal is not active");
        require(msg.value > 0, "No ether provided");
        require(amt + msg.value <= max_amount, "Exceeds max funding amount");

        amt += msg.value;
        investors_to_amt[msg.sender] += msg.value;

        if (investors_to_amt[msg.sender] == msg.value) {
            investors.push(msg.sender);
        }

        emit Invested(msg.sender, msg.value);
    }

    function execute_proposal(address payable _target) public onlyProposer {
    require(is_proposal_active, "Proposal already executed");
    require(amt >= min_amount, "Minimum threshold not reached");

    (bool sent,) = _target.call{value: amt}("");
    require(sent, "Transfer to target failed");

    executionTime = block.timestamp;
    emit ProposalExecuted(_target, amt);
    is_proposal_active = false;
}


   function distribute_profit() public onlyProposer {
    require(!is_proposal_active, "Cannot distribute before execution");
    require(block.timestamp >= executionTime + cooldown, "Cooldown period not reached");

    uint256 proposer_share = (amt * investor_share) / 100;
    uint256 total_investors_share = amt - proposer_share;

    uint256 contractBalance = address(this).balance;
    require(contractBalance >= amt, "Insufficient contract balance for distribution");

    (bool sentProposer,) = proposer.call{value: proposer_share}("");
    require(sentProposer, "Transfer to proposer failed");

    for (uint256 i = 0; i < investors.length; i++) {
        address investor = investors[i];
        uint256 share = (investors_to_amt[investor] * total_investors_share) / amt;
        (bool success,) = investor.call{value: share}("");
        require(success, "Transfer to investor failed");
    }
}


    function execute_and_distribute_profit() public onlyProposer nonReentrant {
        execute_proposal(payable(target));

        distribute_profit();
    }
    receive() external payable {

    }
    function contractbalance() public view returns (uint256) {
        return address(this).balance;}
}
