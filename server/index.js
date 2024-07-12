// server/index.js
// This is the main server file which initializes the Express app and sets up routes.

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
