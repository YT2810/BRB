// scripts/mint.js

require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

async function main() {
  // Configure the connection to an Ethereum node
  const network = "https://sepolia.infura.io/v3/" + process.env.INFURA_PROJECT_ID;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));

  // Create a signing account from a private key
  const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  // Read the ABI from the compiled contract
  const contractPath = path.resolve(__dirname, '../client/src/abi/FractlsNFT.json');
  const { abi } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  // Deployed contract address
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  // Create a contract instance
  const contract = new web3.eth.Contract(abi, contractAddress);

  // Get the original token URI and fraction token URIs from command line arguments
  const originalTokenURI = process.argv[2];
  const fractionTokenURIs = process.argv.slice(3);

  if (!originalTokenURI || fractionTokenURIs.length !== 9) {
    console.error("Invalid input: originalTokenURI and 9 fractionTokenURIs are required.");
    process.exit(1);
  }

  console.log("Minting original and fractional NFTs...");
  // Call the createCollectible function of the contract to mint the NFTs
  const tx = await contract.methods.createCollectible(originalTokenURI, fractionTokenURIs).send({ from: account.address });
  console.log("Transaction hash:", tx.transactionHash);
  console.log("NFTs minted successfully.");
}

// Execute the main function and handle errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

