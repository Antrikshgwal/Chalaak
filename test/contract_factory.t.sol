// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Test, console} from "forge-std/Test.sol";
import {factory} from "../../src/contract_factory.sol";
import {ProposalContract} from "../../src/proposal.sol";
import {StdCheats} from "forge-std/StdCheats.sol";

interface IProposalContract {
    function invest() external payable;
}

contract FactoryTest is Test, factory {
    factory public Factory;
    Proposal public proposal;

    function setUp() external {
        Factory = new factory();
    }

    function testSafeMint() external {
        address to = address(0x123);
        uint256 tokenId = Factory.safeMint(to);
        assertEq(Factory.ownerOf(tokenId), to, "Token owner should be the recipient");
        console.log("Token minted with ID:", tokenId);
    }

    function testgetbytecode1() external {
        proposal = Proposal({
            proposer: address(0x123),
            proposal_id: 1,
            is_proposal_active: true,
            target: address(0x456),
            min_amount: 100,
            max_amount: 1000,
            investor_share: 10
        });

        bytes memory bytecode = Factory.getBytecode1(proposal);
        assertTrue(bytecode.length > 0, "Bytecode should not be empty");
    }

    function test_create_proposal() external {
        proposal = Proposal({
            proposer: address(0x123),
            proposal_id: 1,
            is_proposal_active: true,
            target: address(0x456),
            min_amount: 100,
            max_amount: 1000,
            investor_share: 10
        });
        address proposaladdr = create_proposals(proposal);
        assertTrue(proposaladdr != address(0), "Proposal not deployed");
        console.log("Proposal address: ", proposaladdr);
    }

    function test_multiple_proposal_deploy() external {
        proposal = Proposal({
            proposer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
            proposal_id: 1,
            is_proposal_active: true,
            target: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            min_amount: 100,
            max_amount: 1000,
            investor_share: 10
        });
        address proposaladdr1 = create_proposals(proposal);
        assertTrue(proposaladdr1 != address(0x123), "Proposal not deployed");

        proposal.proposal_id = 2;
        address proposaladdr2 = create_proposals(proposal);
        assertTrue(proposaladdr2 != address(0x123), "Second proposal not deployed");

        console.log("First Proposal address: ", proposaladdr1);
        console.log("Second Proposal address: ", proposaladdr2);
    }

    function test_duplicate_proposal_id_reverts() external {
        proposal = Proposal({
            proposer: address(0x123),
            proposal_id: 1,
            is_proposal_active: true,
            target: address(0x456),
            min_amount: 100,
            max_amount: 1000,
            investor_share: 10
        });

        vm.prank(address(0x123));
        Factory.create_proposals(proposal);

        vm.expectRevert("Proposal is already active");
        vm.prank(address(0x456));
        Factory.create_proposals(proposal);
    }

    function test_fetch_proposal() external {
        address fakeProposer = address(0x123);

        Proposal memory proposal1 = Proposal({
            proposer: fakeProposer,
            proposal_id: 1,
            is_proposal_active: true,
            target: address(0x456),
            min_amount: 100,
            max_amount: 1000,
            investor_share: 10
        });

        vm.prank(fakeProposer);
        address proposalAddr = Factory.create_proposals(proposal1);

        (
            address storedProposer,
            uint256 storedId,
            bool isActive,
            address target,
            uint256 minAmt,
            uint256 maxAmt,
            uint256 share
        ) = Factory.proposals(proposalAddr);

        assertEq(storedProposer, fakeProposer);
        assertEq(storedId, 1);
        assertEq(isActive, true);
        assertEq(target, address(0x456));
        assertEq(minAmt, 100);
        assertEq(maxAmt, 1000);
        assertEq(share, 10);
    }

    function test_invest() external {
        address fakeProposer = address(0x123);

        Proposal memory proposal1 = Proposal({
            proposer: fakeProposer,
            proposal_id: 1,
            is_proposal_active: true,
            target: address(0x456),
            min_amount: 100,
            max_amount: 1000,
            investor_share: 10
        });

        vm.prank(fakeProposer);
        address proposalAddr = Factory.create_proposals(proposal1);

        uint256 investmentAmount = 200;
        vm.deal(address(this), investmentAmount);
        vm.prank(address(this));
        IProposalContract(proposalAddr).invest{value:investmentAmount}();
    }

    function test_invest_exceeds_max_should_fail() external {
        address proposer = address(0x111);
        Proposal memory proposal1 = Proposal({
            proposer: proposer,
            proposal_id: 1,
            is_proposal_active: true,
            target: address(0x999),
            min_amount: 100,
            max_amount: 300,
            investor_share: 10
        });

        vm.prank(proposer);
        address proposalAddr = Factory.create_proposals(proposal1);

        vm.deal(address(this), 500);
        vm.prank(address(this));
        vm.expectRevert("Exceeds max funding amount");
        IProposalContract(proposalAddr).invest{value: 500}();
    }

    function test_invest_zero_should_fail() external {
        address proposer = address(0x111);
        Proposal memory proposal1 = Proposal({
            proposer: proposer,
            proposal_id: 1,
            is_proposal_active: true,
            target: address(0x999),
            min_amount: 100,
            max_amount: 1000,
            investor_share: 10
        });

        vm.prank(proposer);
        address proposalAddr = Factory.create_proposals(proposal1);

        vm.deal(address(this), 0);
        vm.prank(address(this));
        vm.expectRevert("No ether provided");
        IProposalContract(proposalAddr).invest{value: 0}();
    }
}
