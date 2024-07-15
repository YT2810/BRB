// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FractlsNFT.sol";

contract DeployFractls is Script {
    function run() external {
        // Load environment variables
        address intermediaryWallet = vm.envAddress("INTERMEDIARY_WALLET");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        uint256 commissionPercentage = vm.envUint("COMMISSION_PERCENTAGE");

        vm.startBroadcast();
        
        FractlsNFT fractlsNFT = new FractlsNFT(intermediaryWallet, initialOwner, commissionPercentage);
        
        vm.stopBroadcast();

        // Print the contract address to the console
        console.log("FractlsNFT deployed to:", address(fractlsNFT));
    }
}
