// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FractlsNFT
 * @dev Smart contract to manage the minting and ownership of fractionalized NFTs
 */
contract FractlsNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    mapping(uint256 => uint256) public originalToFractions;
    mapping(uint256 => bool) public fractionsMinted;
    uint256 public constant TOTAL_FRACTIONS = 9;
    address public intermediaryWallet;

    /**
     * @dev Constructor to set the intermediary wallet and initialize the contract
     * @param _intermediaryWallet Address of the wallet that will hold the NFTs initially
     * @param initialOwner Address of the initial owner of the contract
     */
    constructor(address _intermediaryWallet, address initialOwner) ERC721("FractlsNFT", "FRACT") Ownable(initialOwner) {
        tokenCounter = 0;
        intermediaryWallet = _intermediaryWallet;
    }

    /**
     * @dev Function to create the original NFT and its fractions
     * @param originalTokenURI The URI of the original token metadata
     * @param fractionTokenURIs An array of URIs for the fraction tokens metadata
     * @return The IDs of the newly minted tokens
     */
    function createCollectible(string memory originalTokenURI, string[] memory fractionTokenURIs) public onlyOwner returns (uint256[] memory) {
        require(fractionTokenURIs.length == TOTAL_FRACTIONS, "There must be 9 fraction URIs");

        uint256[] memory newItemIds = new uint256[](TOTAL_FRACTIONS + 1);

        // Mint the original NFT
        uint256 newOriginalItemId = tokenCounter;
        _safeMint(intermediaryWallet, newOriginalItemId);
        _setTokenURI(newOriginalItemId, originalTokenURI);
        newItemIds[0] = newOriginalItemId;
        tokenCounter++;

        // Mint the fractional NFTs
        for (uint256 i = 0; i < TOTAL_FRACTIONS; i++) {
            uint256 newFractionItemId = tokenCounter;
            _safeMint(intermediaryWallet, newFractionItemId);
            _setTokenURI(newFractionItemId, fractionTokenURIs[i]);
            newItemIds[i + 1] = newFractionItemId;
            originalToFractions[newFractionItemId] = newOriginalItemId;
            fractionsMinted[newOriginalItemId] = true;
            tokenCounter++;
        }

        return newItemIds;
    }

    /**
     * @dev Function to claim the original NFT if all fractions are owned
     * @param fractionIds The IDs of the fraction tokens
     */
    function claimOriginal(uint256[] memory fractionIds) public {
        require(fractionIds.length == TOTAL_FRACTIONS, "Must provide 9 fraction IDs");

        uint256 originalId = originalToFractions[fractionIds[0]];
        for (uint256 i = 0; i < TOTAL_FRACTIONS; i++) {
            require(ownerOf(fractionIds[i]) == msg.sender, "You do not own all fractions");
            require(originalToFractions[fractionIds[i]] == originalId, "Fractions do not match the same original");
        }

        // Transfer original NFT to the claimer
        _transfer(ownerOf(originalId), msg.sender, originalId);

        // Burn the fraction NFTs
        for (uint256 i = 0; i < TOTAL_FRACTIONS; i++) {
            _burn(fractionIds[i]);
        }

        fractionsMinted[originalId] = false;
    }
}
