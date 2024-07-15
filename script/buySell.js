require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Transferring fraction tokens to buyer...");

  const network = "https://sepolia.infura.io/v3/" + process.env.INFURA_PROJECT_ID;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));

  const intermediaryAccount = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(intermediaryAccount);

  const buyerAccount = web3.eth.accounts.privateKeyToAccount(process.env.BUYER_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(buyerAccount);

  const contractPath = path.resolve(__dirname, '../client/src/abi/FractlsNFT.json');
  const { abi } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contract = new web3.eth.Contract(abi, contractAddress);

  const fractionIds = [2, 3, 4, 5, 6, 7, 8, 9]; // Ensure these are correct IDs
  for (let id of fractionIds) {
    console.log(`Transferring fraction token ID ${id} to buyer...`);

    try {
      const tx = await contract.methods.safeTransferFrom(intermediaryAccount.address, buyerAccount.address, id).send({ from: intermediaryAccount.address, gas: 300000 });
      console.log(`Fraction token ID ${id} transferred to buyer: ${buyerAccount.address}`);
    } catch (error) {
      console.error(`Error transferring token ID ${id}:`, error);
    }
  }

  console.log("All fraction tokens transferred to buyer.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
