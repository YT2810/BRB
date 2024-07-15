// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title FractlsNFT
 * @dev Smart contract to manage the minting, ownership, and sale of fractionalized NFTs
 */
contract FractlsNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    uint256 public tokenCounter; // Counter to keep track of the token IDs
    uint256 public constant TOTAL_FRACTIONS = 9; // Constant representing the total number of fractions
    uint256 public platformCommissionPercentage; // Commission percentage for the platform

    struct Fraction {
        uint256 price;
        address owner;
    }

    struct ArtistInfo {
        address artist;
        uint256 commissionPercentage;
    }

    mapping(uint256 => ArtistInfo) public originalToArtist; // Mapping from original token ID to artist info
    mapping(uint256 => uint256) public originalToFractions; // Mapping from fraction token ID to original token ID
    mapping(uint256 => bool) public fractionsMinted; // Mapping to check if fractions are minted for a given original token
    mapping(uint256 => Fraction) public fractions; // Mapping from fraction token ID to its price and owner

    event OriginalMinted(uint256 indexed tokenId, string tokenURI); // Event emitted when the original NFT is minted
    event FractionMinted(uint256 indexed tokenId, uint256 indexed originalId, string tokenURI, uint256 price); // Event emitted when a fraction is minted
    event OriginalClaimed(uint256 indexed originalId, address indexed claimer); // Event emitted when the original NFT is claimed
    event FundsDistributed(uint256 indexed tokenId, uint256 amount, address indexed artist, uint256 artistCommission, uint256 platformCommission); // Event emitted when funds are distributed
    event CommissionPercentageChanged(uint256 newPercentage); // Event emitted when the commission percentage is changed
    event DebugLog(string message, uint256 value); // Debug event

    /**
     * @dev Constructor to initialize the contract
     * @param initialOwner Address of the initial owner of the contract
     * @param _platformCommissionPercentage Commission percentage for the platform
     */
    constructor(address initialOwner, uint256 _platformCommissionPercentage) 
        ERC721("FractlsNFT", "FRACT") 
        Ownable(initialOwner) 
    {
        tokenCounter = 0;
        platformCommissionPercentage = _platformCommissionPercentage; // Set the commission percentage
    }

    /**
     * @dev Function to set the platform commission percentage
     * @param _newPercentage The new commission percentage
     */
    function setPlatformCommissionPercentage(uint256 _newPercentage) public onlyOwner {
        platformCommissionPercentage = _newPercentage;
        emit CommissionPercentageChanged(_newPercentage);
    }

    /**
     * @dev Function to convert ETH to wei
     * @param ethAmount The amount in ETH as a string
     * @return The amount in wei
     */
    function ethToWei(string memory ethAmount) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(ethAmount)));
    }

    /**
     * @dev Function to mint the original NFT and fractional NFTs
     * @param originalTokenURI The URI of the original token metadata
     * @param fractionTokenURIs An array of URIs for the fraction tokens metadata
     * @param artist Address of the artist
     * @param artistCommissionPercentage The commission percentage for the artist
     * @param totalPrice The total price for all fractions combined in ETH
     * @return The IDs of the newly minted original and fraction tokens
     */
    function mintOriginalAndFractions(
        string memory originalTokenURI,
        string[] memory fractionTokenURIs,
        address artist,
        uint256 artistCommissionPercentage,
        string memory totalPrice
    ) public returns (uint256, uint256[] memory) {
        emit DebugLog("mintOriginalAndFractions called", 0);
        
        // Convert totalPrice from ETH to wei
        uint256 totalPriceInWei = ethToWei(totalPrice);

        // Mint original NFT
        uint256 newOriginalItemId = tokenCounter;
        _safeMint(msg.sender, newOriginalItemId); // Mint the original NFT to the sender's address
        _setTokenURI(newOriginalItemId, originalTokenURI); // Set the URI of the original NFT
        originalToArtist[newOriginalItemId] = ArtistInfo(artist, artistCommissionPercentage); // Record the artist's address and commission percentage
        tokenCounter++;
        emit OriginalMinted(newOriginalItemId, originalTokenURI); // Emit the event
        emit DebugLog("Original minted", newOriginalItemId);
        
        // Mint fractional NFTs
        require(fractionTokenURIs.length == TOTAL_FRACTIONS, "There must be 9 fraction URIs");

        uint256[] memory newFractionItemIds = new uint256[](TOTAL_FRACTIONS);
        uint256 fractionPrice = totalPriceInWei / TOTAL_FRACTIONS; // Calculate the price for each fraction in wei

        for (uint256 i = 0; i < TOTAL_FRACTIONS; i++) {
            uint256 newFractionItemId = tokenCounter;
            _safeMint(msg.sender, newFractionItemId); // Mint the fraction to the sender's address
            _setTokenURI(newFractionItemId, fractionTokenURIs[i]); // Set the URI of the fraction

            fractions[newFractionItemId] = Fraction(fractionPrice, msg.sender); // Record the price and owner of the fraction
            newFractionItemIds[i] = newFractionItemId;
            originalToFractions[newFractionItemId] = newOriginalItemId; // Link the fraction to the original NFT
            emit FractionMinted(newFractionItemId, newOriginalItemId, fractionTokenURIs[i], fractionPrice); // Emit the event
            tokenCounter++;
        }
        fractionsMinted[newOriginalItemId] = true;
        emit DebugLog("Fractions minted for original", newOriginalItemId);

        return (newOriginalItemId, newFractionItemIds);
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

        _transfer(owner(), msg.sender, originalId); // Transfer the original NFT to the claimer
        for (uint256 i = 0; i < TOTAL_FRACTIONS; i++) {
            _burn(fractionIds[i]); // Burn the fraction tokens
        }

        fractionsMinted[originalId] = false;
        emit OriginalClaimed(originalId, msg.sender); // Emit the event
    }

    /**
     * @dev Function to distribute funds to the artist and owner
     * @param tokenId The ID of the token being sold
     * @param amount The total amount paid by the buyer in wei
     */
    function distributeFunds(uint256 tokenId, uint256 amount) internal {
        ArtistInfo memory artistInfo = originalToArtist[originalToFractions[tokenId]];
        require(artistInfo.artist != address(0), "Artist address not found");

        uint256 platformCommission = (amount * platformCommissionPercentage) / 100;
        uint256 artistCommission = (amount * artistInfo.commissionPercentage) / 100;
        uint256 sellerShare = amount - platformCommission - artistCommission;

        payable(owner()).transfer(platformCommission); // Transfer the commission to the owner
        payable(artistInfo.artist).transfer(artistCommission); // Transfer the artist's commission
        payable(msg.sender).transfer(sellerShare); // Transfer the remaining amount to the seller

        emit FundsDistributed(tokenId, amount, artistInfo.artist, artistCommission, platformCommission); // Emit the event
    }

    /**
     * @dev Function to transfer a fraction token to a buyer and handle payment
     * @param fractionId The ID of the fraction token
     * @param buyer The address of the buyer
     */
    function transferFraction(uint256 fractionId, address buyer) public payable {
        Fraction memory fraction = fractions[fractionId];
        require(msg.value == fraction.price, "Incorrect payment amount");
        require(fraction.owner == msg.sender, "You are not the owner of this fraction");

        _transfer(fraction.owner, buyer, fractionId); // Transfer the fraction token
        distributeFunds(fractionId, msg.value); // Distribute the funds
        fractions[fractionId].owner = buyer; // Update the owner of the fraction
    }
}

