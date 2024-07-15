require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Claiming the original NFT...");

  const network = "https://sepolia.infura.io/v3/" + process.env.INFURA_PROJECT_ID;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));

  const account = web3.eth.accounts.privateKeyToAccount(process.env.BUYER_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  const contractPath = path.resolve(__dirname, '../client/src/abi/FractlsNFT.json');
  const { abi } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contract = new web3.eth.Contract(abi, contractAddress);

  const fractionIds = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Ensure these are correct IDs
  const tx = await contract.methods.claimOriginal(fractionIds).send({ from: account.address });
  console.log("Transaction hash:", tx.transactionHash);
  console.log("Original NFT claimed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
