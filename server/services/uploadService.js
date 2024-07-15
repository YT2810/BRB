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

function writeImage(image, filePath) {
  return new Promise((resolve, reject) => {
    image.write(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function convertWebpToJpeg(filePath) {
  const outputFilePath = filePath.replace('.webp', '.jpeg');
  await webp.dwebp(filePath, outputFilePath, '-o');
  return outputFilePath;
}

async function fractionateImage(imagePath, owner, totalPrice) {
  let image = await Jimp.read(imagePath);

  if (imagePath.endsWith('.webp')) {
    const convertedImagePath = await convertWebpToJpeg(imagePath);
    image = await Jimp.read(convertedImagePath);
  }

  const width = image.bitmap.width / 3;
  const height = image.bitmap.height / 3;

  const fractionPrice = totalPrice / 9;
  const promises = [];
  const fractionedImages = [];

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const clone = image.clone();
      const fragmentPath = path.join(__dirname, '../uploads', `fragment_${x}_${y}.jpeg`);
      await writeImage(clone.crop(x * width, y * height, width, height), fragmentPath);
      promises.push(uploadToPinata(fragmentPath).then(data => {
        fractionedImages.push(`ipfs://${data.IpfsHash}`);
      }));
    }
  }

  await Promise.all(promises);

  const originalImageUri = await uploadToPinata(imagePath);
  const newImage = new Image({
    originalImage: `ipfs://${originalImageUri.IpfsHash}`,
    fractionedImages: fractionedImages,
    owner: owner,
    price: totalPrice
  });

  await newImage.save();

  return { originalImage: `ipfs://${originalImageUri.IpfsHash}`, fractionedImages };
}

module.exports = { fractionateImage, uploadToPinata };
