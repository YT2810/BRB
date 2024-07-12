// server/services/uploadService.js
// This service handles image fractionation and uploads to IPFS using Pinata.

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');
const webp = require('webp-converter');  // Import the webp-converter for handling webp images
const Image = require('../models/ImageModel'); // Import the Image model
const Batch = require('../models/BatchModel'); // Import the Batch model
require('dotenv').config(); // Ensure dotenv is configured

// Retrieve Pinata JWT from environment variables
const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Uploads a file to Pinata using JWT for authentication
 * @param {string} filePath - Path to the file to be uploaded
 * @returns {Promise<Object>} - Response data from Pinata
 */
async function uploadToPinata(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  try {
    const res = await axios.post(url, data, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error uploading to Pinata:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Writes a Jimp image to disk and ensures it is completed before resolving the promise
 * @param {Jimp} image - The Jimp image object
 * @param {string} filePath - Path to write the image
 * @returns {Promise<void>}
 */
function writeImage(image, filePath) {
  return new Promise((resolve, reject) => {
    image.write(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Converts a webp image to jpeg using webp-converter
 * @param {string} filePath - Path to the webp image
 * @returns {Promise<string>} - Path to the converted jpeg image
 */
async function convertWebpToJpeg(filePath) {
  const outputFilePath = filePath.replace('.webp', '.jpeg');
  await webp.dwebp(filePath, outputFilePath, '-o');
  return outputFilePath;
}

/**
 * Generates random prices for fractions ensuring their sum equals the total price
 * @param {number} totalPrice - Total price of the NFT
 * @param {number} numFractions - Number of fractions
 * @returns {Array<number>} - Array of random prices for each fraction
 */
function generateRandomPrices(totalPrice, numFractions) {
  let prices = [];
  let remainingPrice = totalPrice;

  for (let i = 0; i < numFractions - 1; i++) {
    let price = Math.random() * remainingPrice;
    prices.push(price);
    remainingPrice -= price;
  }

  prices.push(remainingPrice); // Add remaining price as the last fraction's price
  return prices;
}

/**
 * Fractionates an image into 9 parts and uploads them to Pinata
 * @param {string} imagePath - Path to the image to be fractionated
 * @param {string} owner - Wallet address of the owner
 * @param {number} totalPrice - Total price of the NFT
 * @returns {Promise<Object>} - Object containing the original image and fractions data
 */
async function fractionateImage(imagePath, owner, totalPrice) {
  let image = await Jimp.read(imagePath);

  // If the image is in webp format, convert it to jpeg first
  if (imagePath.endsWith('.webp')) {
    const convertedImagePath = await convertWebpToJpeg(imagePath);
    image = await Jimp.read(convertedImagePath);
  }

  const width = image.bitmap.width / 3;
  const height = image.bitmap.height / 3;

  const prices = generateRandomPrices(totalPrice, 9); // Generate random prices
  const promises = [];
  const fractionedImages = [];

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const clone = image.clone();
      const fragmentPath = path.join(__dirname, '../uploads', `fragment_${x}_${y}.jpeg`);
      await writeImage(clone.crop(x * width, y * height, width, height), fragmentPath);
      promises.push(uploadToPinata(fragmentPath).then(data => {
        fractionedImages.push(data.IpfsHash);
      }));
    }
  }

  await Promise.all(promises);

  // Save the image and its fractions to the database
  const newImage = new Image({
    originalImage: imagePath,
    fractionedImages: fractionedImages,
    owner: owner,
    price: totalPrice
  });

  await newImage.save();

  return { originalImage: imagePath, fractionedImages };
}

// Export functions to be used in other files
module.exports = { fractionateImage, uploadToPinata };
