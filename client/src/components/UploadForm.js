// client/src/components/UploadForm.js
import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = ({ web3, account }) => {
  const [image, setImage] = useState(null);
  const [totalPrice, setTotalPrice] = useState('');
  const [fractions, setFractions] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', image);
    formData.append('totalPrice', totalPrice);
    formData.append('owner', account);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFractions(response.data.fractions);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div>
      <h1>Upload an Image</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Select image:
          <input type="file" onChange={handleImageChange} required />
        </label>
        <br />
        <label>
          Total Price:
          <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Upload</button>
      </form>

      {fractions && (
        <div>
          <h2>Fractions:</h2>
          <ul>
            {fractions.fractionedImages.map((hash, index) => (
              <li key={index}>
                <a href={`https://gateway.pinata.cloud/ipfs/${hash}`} target="_blank" rel="noopener noreferrer">
                  Fraction {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
