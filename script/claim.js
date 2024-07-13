// scripts/claim.js

require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Claiming the original NFT...");

  // Configura la conexión a un nodo Ethereum
  const network = "https://sepolia.infura.io/v3/" + process.env.INFURA_PROJECT_ID;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));

  // Crea una cuenta de firma desde una clave privada
  const account = web3.eth.accounts.privateKeyToAccount(process.env.BUYER_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  // Lee el ABI del contrato
  const contractPath = path.resolve(__dirname, '../client/src/abi/FractlsNFT.json');
  const { abi } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  // Dirección del contrato desplegado
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contract = new web3.eth.Contract(abi, contractAddress);

  // Reclama el NFT original
  const fractionIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const tx = await contract.methods.claimOriginal(fractionIds).send({ from: account.address });
  console.log("Transaction hash:", tx.transactionHash);
  console.log("Original NFT claimed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
