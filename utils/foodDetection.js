import 'dotenv/config';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

// Make sure the keys are loaded from the .env
const IMAGGA_KEY    = process.env.IMAGGA_API_KEY;
const IMAGGA_SECRET = process.env.IMAGGA_API_SECRET;
if (!IMAGGA_KEY || !IMAGGA_SECRET) {
  throw new Error('Missing IMAGGA_API_KEY or IMAGGA_API_SECRET in .env');
}

// Building Basic Auth header
const authHeader = 'Basic ' +
  Buffer.from(`${IMAGGA_KEY}:${IMAGGA_SECRET}`).toString('base64');

/**
 * Sends POST with form-data to Imagga and returns up to 10 labels
 * @param {string} imagePath - Path to the image (e.g. 'public/uploads/foo.jpg')
 * @returns {Promise<Array<{ name: string, confidence: number }>>}
 */
export async function detectFood(imagePath) {
  // 1) Receiving the file and Base64
  const base64 = fs.readFileSync(imagePath, { encoding: 'base64' });

  // 2) Preparing form data
  const form = new FormData();
  form.append('image_base64', base64);

  try {
    // 3) Sending the request to Imagga
    const resp = await axios.post(
      'https://api.imagga.com/v2/tags',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: authHeader
        }
      }
    );

    // 4) Log for selecting initial labels
    console.log('Imagga tags:', resp.data.result.tags.slice(0, 5));

    // 5) Processing the responses
    const tags = resp.data.result.tags || [];
    return tags
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
      .map(t => ({
        name:       t.tag.en,
        confidence: t.confidence / 100
      }));
  } catch (err) {
    // 6) Error handling
    console.error('Imagga food detection failed:', err.response?.data || err);
    return [];
  }
}

// In case also want `default export`
export default detectFood;
