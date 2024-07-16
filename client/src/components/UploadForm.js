import React, { useState } from 'react';

const UploadForm = ({ account, handleUpload }) => {
  const [image, setImage] = useState(null);
  const [totalPrice, setTotalPrice] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please upload an image.');
      return;
    }
    await handleUpload(image, totalPrice);
  };

  return (
    <div className="upload-form">
      <div className="form-container">
        <h1>Upload Your Design</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select your design:</label>
            <input
              type="file"
              id="file-upload"
              onChange={handleImageChange}
              required
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="custom-file-upload">
              {image ? image.name : 'Upload your design'}
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">Total Price:</label>
            <input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              required
              className="input-price"
            />
          </div>
          <button type="submit" className="mint-button">Mint</button>
        </form>
      </div>
      <div className="image-preview">
        {image ? (
          <img src={URL.createObjectURL(image)} alt="Preview" />
        ) : (
          <div className="placeholder">Image Preview</div>
        )}
      </div>
    </div>
  );
};

export default UploadForm;
