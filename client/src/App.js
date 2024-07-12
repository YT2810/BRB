// src/App.js
import React from 'react';
import './App.css';
import ConnectWallet from './ConnectWallet'; // Import the ConnectWallet component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Fractls DApp</h1>
        <ConnectWallet /> {/* Include the ConnectWallet component */}
      </header>
    </div>
  );
}

export default App;
