// src/ConnectWallet.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const ConnectWallet = () => {
  const [account, setAccount] = useState(''); // State to store the connected account
  const [web3, setWeb3] = useState(null); // State to store the Web3 instance

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum); // Create a new Web3 instance
      setWeb3(web3); // Set the Web3 instance in state
    } else {
      alert('Please install MetaMask!'); // Alert the user to install MetaMask
    }
  }, []);

  const connectWallet = async () => {
    if (web3) {
      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]); // Set the first account in state
      } catch (error) {
        console.error('Error connecting to MetaMask:', error); // Log any errors
      }
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account}` : 'Connect Wallet'} {/* Display account or connect button */}
      </button>
    </div>
  );
};

export default ConnectWallet;
