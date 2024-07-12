// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FractlsNFT.sol";

contract DeployFractls is Script {
    function run() external {
        vm.startBroadcast();
        
        // Replace this with the intermediary wallet address
        address intermediaryWallet = 0xa3239Cbe374bdF2DD182e49CC64064Ff23b52Ee2;
        
        new FractlsNFT(intermediaryWallet);
        
        vm.stopBroadcast();
    }
}
