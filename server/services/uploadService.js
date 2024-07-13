// server/services/uploadService.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');
const webp = require('webp-converter');
const Image = require('../models/ImageModel');
require('dotenv').config();

const PINATA_JWT = process.env.PINATA_JWT;

// Function to upload a file to Pinata using JWT for authentication
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
    console.log('Pinata response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error uploading to Pinata:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to write a Jimp image to disk
function writeImage(image, filePath) {
  return new Promise((resolve, reject) => {
    image.write(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Function to convert a WebP image to JPEG
async function convertWebpToJpeg(filePath) {
  const outputFilePath = filePath.replace('.webp', '.jpeg');
  await webp.dwebp(filePath, outputFilePath, '-o');
  return outputFilePath;
}

// Function to generate random prices for fractions
function generateRandomPrices(totalPrice, numFractions) {
  let prices = [];
  let remainingPrice = totalPrice;

  for (let i = 0; i < numFractions - 1; i++) {
    let price = Math.random() * remainingPrice;
    prices.push(price);
    remainingPrice -= price;
  }

  prices.push(remainingPrice);
  return prices;
}

// Function to fractionate an image into 9 parts and upload to Pinata
async function fractionateImage(imagePath, owner, totalPrice) {
  let image = await Jimp.read(imagePath);

  // Convert WebP image to JPEG if necessary
  if (imagePath.endsWith('.webp')) {
    const convertedImagePath = await convertWebpToJpeg(imagePath);
    image = await Jimp.read(convertedImagePath);
  }

  const width = image.bitmap.width / 3;
  const height = image.bitmap.height / 3;

  const prices = generateRandomPrices(totalPrice, 9);
  const promises = [];
  const fractionedImages = [];

  // Fractionate the image into 9 parts and upload each to Pinata
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
    fractionedImages: fractionedImages, // Ensure only URIs are saved
    owner: owner,
    price: totalPrice
  });

  await newImage.save();

  return { originalImage: imagePath, fractionedImages };
}

// Export functions to be used in other files
module.exports = { fractionateImage, uploadToPinata };
