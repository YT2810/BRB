// server/index.js
// This is the main server file which initializes the Express app and sets up routes.

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { exec } = require('child_process');
const uploadRouter = require('./routes/upload');
require('dotenv').config(); // Ensure dotenv is configured

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection URI from environment variables or fallback to local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use('/upload', uploadRouter);

// Serve a simple HTML form for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to mint
app.post('/mint', (req, res) => {
  const originalTokenURI = req.body.originalTokenURI;
  const fractionTokenURIs = req.body.fractionTokenURIs;

  if (!originalTokenURI || !fractionTokenURIs || fractionTokenURIs.length !== 9) {
    return res.status(400).send('Invalid request. Missing originalTokenURI or fractionTokenURIs.');
  }

  const scriptPath = path.resolve(__dirname, 'scripts/mint.js');
  exec(`node ${scriptPath} ${originalTokenURI} ${fractionTokenURIs.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing mint script: ${stderr}`);
      return res.status(500).send('Minting failed.');
    }
    console.log(`Mint script output: ${stdout}`);
    res.send('Minting completed.');
  });
});

// Endpoint for buySell
app.post('/buySell', (req, res) => {
  const scriptPath = path.resolve(__dirname, 'scripts/buySell.js');
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing buySell script: ${stderr}`);
      return res.status(500).send('Buy and sell failed.');
    }
    console.log(`BuySell script output: ${stdout}`);
    res.send('Buy and sell completed.');
  });
});

// Endpoint for claim
app.post('/claim', (req, res) => {
  const scriptPath = path.resolve(__dirname, 'scripts/claim.js');
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing claim script: ${stderr}`);
      return res.status(500).send('Claim failed.');
    }
    console.log(`Claim script output: ${stdout}`);
    res.send('Claim completed.');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
