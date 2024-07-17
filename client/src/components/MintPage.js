import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import UploadForm from './UploadForm';
import FractlsNFT from '../abi/FractlsNFT.json';

const MintPage = ({ web3, account }) => {
  const [status, setStatus] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializePushAPI = async () => {
      try {
        const PK = process.env.REACT_APP_PUSH_PRIVATE_KEY;
        const signer = new ethers.Wallet(`0x${PK}`);

        const userAlice = await PushAPI.initialize(signer, {
          env: process.env.REACT_APP_PUSH_ENV === 'prod' ? CONSTANTS.ENV.PROD : CONSTANTS.ENV.STAGING,
        });

        setUser(userAlice);

        const pushChannelAddress = process.env.REACT_APP_PUSH_CHANNEL_ADDRESS;
        await userAlice.notification.subscribe(`eip155:11155111:${pushChannelAddress}`);

        const stream = await userAlice.initStream([CONSTANTS.STREAM.NOTIF]);
        stream.on(CONSTANTS.STREAM.NOTIF, (data) => {
          console.log('Real-time notification received:', data);
        });

        stream.connect();
      } catch (error) {
        console.error('Error initializing PushAPI:', error);
      }
    };

    initializePushAPI();
  }, []);

  const handleUpload = async (file, totalPrice) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('totalPrice', totalPrice);
    formData.append('owner', account);

    try {
      setStatus('Uploading image and creating fractions...');
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { originalImageUri, fractionedImages } = response.data;

      setStatus('Uploading to blockchain...');

      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      const contract = new web3.eth.Contract(FractlsNFT.abi, contractAddress);

      await contract.methods.mintOriginalAndFractions(originalImageUri, fractionedImages, account, 10, totalPrice).send({ from: account });

      setStatus('Minting completed!');

      if (user) {
        const payload = {
          channelAddress: process.env.REACT_APP_PUSH_CHANNEL_ADDRESS,
          recipients: ['*'], // Enviar a todos los suscriptores
          notification: {
            title: 'New NFT Minted',
            body: 'A new NFT has been minted. Complete the puzzle to reveal more!',
          },
          data: {
            acta: '',
            aimg: '',
            amsg: 'A new NFT has been minted. Complete the puzzle to reveal more!',
            asub: 'New NFT Minted',
            type: '3',
          },
        };

        try {
          const notificationResponse = await user.channel.send(payload.recipients, {
            notification: payload.notification,
            data: payload.data,
          });

          console.log('Notification sent successfully:', notificationResponse);
        } catch (error) {
          console.error('Error sending notification:', error);
          setStatus(`Notification failed: ${error.message}`);
        }
      } else {
        setStatus('Notification failed: User not initialized.');
      }
    } catch (error) {
      console.error('Error in handleUpload:', error);
      setStatus(`Minting failed: ${error.message}`);
    }
  };

  return (
    <div className="mint-container">
      <h2>Mint a new Fractional NFT</h2>
      <UploadForm account={account} handleUpload={handleUpload} />
      <p className="status">{status}</p>
    </div>
  );
};

export default MintPage;
