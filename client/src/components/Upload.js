// Upload.js
// This component allows users to upload an image, set metadata, and trigger the minting process.

import React, { useState } from 'react';
import axios from 'axios';

function Upload({ web3, account }) {
  const [image, setImage] = useState(null);
  const [metadata, setMetadata] = useState({ title: '', description: '', price: 0 });

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('owner', account);

    try {
      const response = await axios.post('/upload', formData);
      const { fractions } = response.data;
      console.log('Fractions:', fractions);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleImageChange} required />
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={metadata.title}
        onChange={handleMetadataChange}
        required
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={metadata.description}
        onChange={handleMetadataChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price in ETH"
        value={metadata.price}
        onChange={handleMetadataChange}
        required
      />
      <button type="submit">Upload and Mint</button>
    </form>
  );
}

export default Upload;
