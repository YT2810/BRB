require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

async function main() {
  const network = "https://sepolia.infura.io/v3/" + process.env.INFURA_PROJECT_ID;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));

  const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  const contractPath = path.resolve(__dirname, '../client/src/abi/FractlsNFT.json');
  const { abi } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contract = new web3.eth.Contract(abi, contractAddress);

  const originalTokenURI = process.argv[2];
  const fractionTokenURIs = process.argv.slice(3);
  const commissionPercentage = process.env.ARTIST_COMMISSION_PERCENTAGE; // Add commission percentage

  if (!originalTokenURI || fractionTokenURIs.length !== 9) {
    console.error("Invalid input: originalTokenURI and 9 fractionTokenURIs are required.");
    process.exit(1);
  }

  console.log("Minting original and fractional NFTs...");
  const tx = await contract.methods.createCollectible(originalTokenURI, fractionTokenURIs, commissionPercentage).send({ from: account.address });
  console.log("Transaction hash:", tx.transactionHash);
  console.log("NFTs minted successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
