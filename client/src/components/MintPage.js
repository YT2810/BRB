// client/src/components/MintPage.js
import React, { useState } from 'react';
import axios from 'axios';
import UploadForm from './UploadForm';
import FractlsNFT from '../abi/FractlsNFT.json';

const MintPage = ({ web3, account }) => {
  const [status, setStatus] = useState('');

  const handleUpload = async (file, totalPrice) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('totalPrice', totalPrice);
    formData.append('owner', account);

    try {
      setStatus('Uploading image and creating fractions...');
      console.log('Uploading image and creating fractions...');
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Server response:', response.data);
      const { originalImageUri, fractionedImages } = response.data;

      if (!originalImageUri || !fractionedImages) {
        throw new Error('Invalid response from server. Missing originalImageUri or fractionedImages.');
      }

      console.log('Original Image URI:', originalImageUri);
      console.log('Fractioned Images:', fractionedImages);

      setStatus('Uploading to blockchain...');
      console.log('Uploading to blockchain...');

      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS; // Use environment variable
      if (!contractAddress) {
        throw new Error('Contract address not found in environment variables.');
      }

      const contract = new web3.eth.Contract(FractlsNFT.abi, contractAddress);
      console.log('Contract instance created:', contract);

      // Mint the original NFT and fractional NFTs
      await contract.methods.mintOriginalAndFractions(originalImageUri, fractionedImages, account, 10, totalPrice).send({ from: account });

      setStatus('Minting completed!');
      console.log('Minting completed!');
    } catch (error) {
      console.error('Error in handleUpload:', error);
      setStatus(`Minting failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Mint a new Fractional NFT</h2>
      <UploadForm account={account} handleUpload={handleUpload} />
      <p>{status}</p>
    </div>
  );
};

export default MintPage;
