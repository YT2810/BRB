// client/src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ account, setShowPopup }) => {
  return (
    <div>
      <main>
        <section className="section1">
          <div className="left-column">
            <h1>Trade NFTs As Shards</h1>
            <p>Enjoy a puzzle-like gaming experience to collect<br />
              fractionalized NFTs and reconstruct<br />
              the complete NFT art.</p>
            <Link to="/mint">
              <button onClick={() => (account ? null : setShowPopup(true))}>Get Started</button>
            </Link>
          </div>
          <div className="right-column">
            <img src="NFT_ART.png" alt="NFT Art" />
          </div>
        </section>
        <section className="section2">
          <p>Recently Reconstructed NFTs</p>
        </section>
        <section className="section3">
          <div className="nft-grid">
            <img src="nft1.png" alt="NFT 1" />
            <img src="nft2.png" alt="NFT 2" />
            <img src="nft3.png" alt="NFT 3" />
          </div>
        </section>
      </main>
      <footer className="App-footer">
        <p>Contact us: fractls@example.com</p>
        <div className="social-icons">
          <a href="https://twitter.com"><img src="twitter_icon.png" alt="Twitter" /></a>
          <a href="https://facebook.com"><img src="facebook_icon.png" alt="Facebook" /></a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
