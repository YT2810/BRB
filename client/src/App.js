import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import MintPage from './components/MintPage';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showMarketplacePopup, setShowMarketplacePopup] = useState(false);

  // Function to connect wallet
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

  // Function to disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
  };

  // Effect to handle account changes
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

  // Protected route to check if wallet is connected
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
        <header className="App-header">
          <div className="header-logo">FRACTLS</div>
          <nav className="header-nav">
            <Link to="/">Home</Link>
            <button onClick={() => setShowMarketplacePopup(true)}>Marketplace</button>
            {account ? (
              <button onClick={disconnectWallet}>
                Disconnect ({account.slice(0, 6)}...{account.slice(-4)})
              </button>
            ) : (
              <button onClick={connectWallet}>Connect Wallet</button>
            )}
          </nav>
        </header>
        {showPopup && (
          <div className="popup">
            <div className="popup-content">
              <button onClick={() => setShowPopup(false)} className="close-popup">X</button>
              <p>Please connect your wallet to mint NFTs.</p>
              <button onClick={connectWallet}>Connect Wallet</button>
            </div>
          </div>
        )}
        {showMarketplacePopup && (
          <div className="popup">
            <div className="popup-content">
              <button onClick={() => setShowMarketplacePopup(false)} className="close-popup">X</button>
              <p>UNDER CONSTRUCTION, COMING SOON</p>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<LandingPage account={account} setShowPopup={setShowPopup} />} />
          <Route path="/mint" element={<ProtectedRoute element={<MintPage web3={web3} account={account} />} />} />
          <Route path="/marketplace" element={<div>Under Construction, coming soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
