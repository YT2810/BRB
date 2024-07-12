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
    uint256 public constant TOTAL_FRACTIONS = 9;
    address public intermediaryWallet;
    mapping(uint256 => uint256) public originalToFractions;
    mapping(uint256 => bool) public fractionsMinted;

    /**
     * @dev Constructor to set the intermediary wallet and initialize the contract
     * @param _intermediaryWallet Address of the wallet that will hold the NFTs initially
     */
    constructor(address _intermediaryWallet) ERC721("FractlsNFT", "FRACT") {
        tokenCounter = 0;
        intermediaryWallet = _intermediaryWallet;
        // Ownable constructor is implicitly called, setting the deployer as the owner
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

    /**
     * @dev Override _burn function from ERC721URIStorage to clear metadata
     * @param tokenId The ID of the token to burn
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Override tokenURI function from ERC721URIStorage to return token URI
     * @param tokenId The ID of the token
     * @return The URI of the token
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override supportsInterface function to support multiple interfaces
     * @param interfaceId The ID of the interface
     * @return Boolean indicating if the interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
