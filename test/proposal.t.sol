// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import {ProposalContract} from "../src/proposal.sol";

contract ProposalContractTest is Test {
    ProposalContract proposalContract;
    ProposalContract.Proposal internal proposal;
    address internal target = address(0x456);
    address payable investor1 = payable(address(0xBEEF));
address payable investor2 = payable(address(0xCAFE));
address payable proposer = payable(address(0xABCD));


    function setUp() public {
        proposal = ProposalContract.Proposal({
            proposer: proposer,
            proposal_id: 1,
            is_proposal_active: true,
            target: target,
            min_amount: 1 ether,
            max_amount: 10 ether,
            investor_share: 20
        });

        proposalContract = new ProposalContract(proposal);
    }

    function testInitialState() view public {
        assertEq(proposalContract.proposer(), proposer);
        assertEq(proposalContract.proposal_id(), 1);
        assertEq(proposalContract.is_proposal_active(), true);
        assertEq(proposalContract.target(), target);
        assertEq(proposalContract.min_amount(), 1 ether);
        assertEq(proposalContract.max_amount(), 10 ether);
        assertEq(proposalContract.investor_share(), 20);
    }

    function testInvest() public {
        vm.deal(investor1, 5 ether);
        vm.prank(investor1);
        proposalContract.invest{value: 5 ether}();

        assertEq(proposalContract.investors_to_amt(investor1), 5 ether);
    }

    function testRevertIfInvestExceedsMax() public {
        vm.deal(investor1, 11 ether);
        vm.prank(investor1);
        vm.expectRevert("Exceeds max funding amount");
        proposalContract.invest{value: 11 ether}();
    }

    function testExecuteAndDistributeProfit_withCooldown() public {
    // Step 1: Fund investors
    vm.deal(investor1, 3 ether);
    vm.deal(investor2, 2 ether);

    // Step 2: Investors invest
    vm.prank(investor1);
    proposalContract.invest{value: 3 ether}();

    vm.prank(investor2);
    proposalContract.invest{value: 2 ether}();

    // Step 3: Contract now has 5 ether, proposer executes proposal
    assertEq(address(proposalContract).balance, 5 ether);

    vm.prank(proposer);
    proposalContract.execute_proposal(payable(target));

    // Step 4: Target receives 5 ether, now sends back 6 ether to simulate profit
    vm.deal(target, 6 ether);
    vm.prank(target);
    (bool sent, ) = address(proposalContract).call{value: 6 ether}("");
    assertTrue(sent, "Target failed to return profit to contract");


    vm.warp(block.timestamp + 1 days + 1);


    uint256 preProposerBal = proposer.balance;
    uint256 preInvestor1Bal = investor1.balance;
    uint256 preInvestor2Bal = investor2.balance;

    vm.prank(proposer);
    proposalContract.distribute_profit();


    uint256 proposerShare = (5 ether * 20) / 100;
    uint256 remaining = 5 ether - proposerShare;
    uint256 i1Share = (3 ether * remaining) / 5 ether;
    uint256 i2Share = (2 ether * remaining) / 5 ether;

    assertEq(proposer.balance, preProposerBal + proposerShare, "Incorrect proposer share");
    assertApproxEqAbs(investor1.balance, preInvestor1Bal + i1Share, 1 wei);
    assertApproxEqAbs(investor2.balance, preInvestor2Bal + i2Share, 1 wei);
}


    function testCannotDistributeBeforeExecution() public {
        vm.prank(proposer);
        vm.expectRevert("Cannot distribute before execution");
        proposalContract.distribute_profit();
    }

    function testOnlyProposerCanExecute() public {
        vm.expectRevert("Only proposer can call this function");
        proposalContract.execute_and_distribute_profit();
    }

}
