require('dotenv').config();
const fs = require('fs');
const { FaceClient } = require('@azure/cognitiveservices-face');
const { CognitiveServicesCredentials } = require('@azure/ms-rest-azure-js');

// Endpoint and key are defined in the .env file.
const endpoint = process.env.AZURE_FACE_ENDPOINT;
const key      = process.env.AZURE_FACE_KEY;

// FaceClient startup
const creds  = new CognitiveServicesCredentials(key);
const client = new FaceClient(creds, endpoint);

/**
 * Inspect an image for facial detection using the Azure Face API
 * @param {string} imagePath - Local path to image
 * @returns {Promise<boolean>} true If at least one face was detected
 */
async function hasFace(imagePath) {
  // Read the file as a stream
  const streamFn = () => fs.createReadStream(imagePath);
  try {
    // Sending to Azure to perform facial recognition
    const detected = await client.face.detectWithStream(
      streamFn,
      { returnFaceId: false, detectionModel: 'detection_01' }
    );
    return Array.isArray(detected) && detected.length > 0;
  } catch (err) {
    console.error('Face detection failed:', err);
    return false;
  }
}

module.exports = { hasFace };
