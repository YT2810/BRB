import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import MintPage from './components/MintPage';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      try {
        await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(newAccounts[0]);
        setShowPopup(false); // Hide popup on successful connection
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });
    }
  }, []);

  const ProtectedRoute = ({ element }) => {
    if (!account) {
      setShowPopup(true); // Show popup if not connected
      return <Navigate to="/" />;
    }
    return element;
  };

  return (
    <Router>
      <div className="App">
        <header>
          {account ? (
            <button onClick={disconnectWallet} style={{ float: 'right' }}>
              Disconnect ({account.slice(0, 6)}...{account.slice(-4)})
            </button>
          ) : (
            <button onClick={connectWallet} style={{ float: 'right' }}>
              Connect Wallet
            </button>
          )}
        </header>
        <h1 style={{ textAlign: 'center' }}>Fractional NFT DApp</h1>
        <p style={{ textAlign: 'center' }}>Decentralized platform to mint and fractionate NFTs.</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/mint">
            <button style={{ marginRight: '10px' }}>MINT</button>
          </Link>
          <Link to="/marketplace">
            <button>Marketplace</button>
          </Link>
        </div>
        {showPopup && (
          <div className="popup">
            <div className="popup-content">
              <p>Please connect your wallet to mint NFTs.</p>
              <button onClick={connectWallet}>Connect Wallet</button>
              <button onClick={() => setShowPopup(false)} className="close-popup">Close</button>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/mint" element={<ProtectedRoute element={<MintPage web3={web3} account={account} />} />} />
          <Route path="/marketplace" element={<div>Marketplace coming soon!</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
