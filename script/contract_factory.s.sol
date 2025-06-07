// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {factory} from "../src/contract_factory.sol";

contract CounterScript is Script {


    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        factory Factory = new factory();
        console.log("Factory deployed at:", address(Factory));

        vm.stopBroadcast();
    }
}
