// client/src/components/MintPage.js
import React, { useState } from 'react';
import axios from 'axios';
import FractlsNFT from '../abi/FractlsNFT.json'; // Asegúrate de que esta ruta es correcta y el archivo FractlsNFT.json existe

const MintPage = ({ web3, account }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMint = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('totalPrice', 1); // Set a default price
    formData.append('owner', account);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData);
      const { fractionedImages } = response.data.fractions;

      // Mint NFTs for each fractioned image
      const contract = new web3.eth.Contract(FractlsNFT.abi, 'YOUR_CONTRACT_ADDRESS'); // Reemplaza 'YOUR_CONTRACT_ADDRESS' con la dirección real de tu contrato

      for (const imageUri of fractionedImages) {
        await contract.methods.mint(imageUri).send({ from: account });
      }

      setStatus('Minting completed!');
    } catch (error) {
      console.error(error);
      setStatus('Minting failed.');
    }
  };

  return (
    <div>
      <h2>Mint a new Fractional NFT</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleMint}>Mint</button>
      <p>{status}</p>
    </div>
  );
};

export default MintPage;
