import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import contractJSON from '../abi/FractlsNFT.json'; // Import the JSON file

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

// Extract the ABI from the imported JSON
const contractABI = contractJSON.abi;

// Initialize web3 instance
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

// Log the ABI to verify it is loaded correctly
console.log(Array.isArray(contractABI)); // This should print true if the ABI is an array
console.log(contractABI); // This should print the ABI array

// Create contract instance with ABI and contract address
const contract = new web3.eth.Contract(contractABI, contractAddress);

function Marketplace() {
  const [fractions, setFractions] = useState([]);

  // Fetch fractions from the backend when the component mounts
  useEffect(() => {
    fetch('/marketplace')
      .then(response => {
        console.log('Response from /marketplace:', response); // Log the response object
        return response.json();
      })
      .then(data => {
        console.log('Data from /marketplace:', data); // Log the data received
        setFractions(data);
      })
      .catch(error => {
        console.error('Error fetching fractions:', error); // Log any errors
      });
  }, []);

  // Function to handle buying a fraction
  const buyFraction = async (fractionId, price) => {
    const accounts = await web3.eth.requestAccounts();
    await contract.methods.transferFraction(fractionId, accounts[0]).send({ from: accounts[0], value: price });
  };

  return (
    <div>
      <h1>Marketplace</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {fractions.length > 0 ? (
          fractions.map(fraction => (
            <div key={fraction.fractionId} style={{ flex: '1 0 30%', margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
              <p>{fraction.tokenURI}</p>
              <p>Price: {web3.utils.fromWei(fraction.price.toString(), 'ether')} ETH</p>
              <button onClick={() => buyFraction(fraction.fractionId, fraction.price)}>Buy</button>
            </div>
          ))
        ) : (
          <p>No fractions available at the moment.</p>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
