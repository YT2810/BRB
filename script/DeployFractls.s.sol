// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FractlsNFT.sol";

contract DeployFractls is Script {
    function run() external {
        // Load environment variables
        address intermediaryWallet = vm.envAddress("INTERMEDIARY_WALLET");
        address initialOwner = vm.envAddress("INITIAL_OWNER");

        vm.startBroadcast();
        
        new FractlsNFT(intermediaryWallet, initialOwner);
        
        vm.stopBroadcast();
    }
}
