// App.js
// This file sets up the Web3 connection and renders the UploadForm component.

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import UploadForm from './components/UploadForm';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => setAccount(accounts[0]));
    } else {
      console.error('Please install MetaMask!');
    }
  }, []);

  return (
    <div className="App">
      <h1>Fractional NFT DApp</h1>
      {account ? (
        <UploadForm web3={web3} account={account} />
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
}

export default App;
