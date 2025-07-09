require('dotenv').config();
const axios = require('axios');

const USDA_API_KEY = process.env.USDA_API_KEY;
if (!USDA_API_KEY) {
  throw new Error('Missing USDA_API_KEY in .env');
}

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

/**
 * 1) Search for an item in the USDA database by name
 * @param {string} query
 * @returns {Promise<Object|null>} The first object found or null
 */
async function searchFood(query) {
  try {
    const resp = await axios.get(`${BASE_URL}/foods/search`, {
      params: {
        api_key: USDA_API_KEY,
        query,
        pageSize: 1
      }
    });
    const foods = resp.data.foods;
    return foods && foods.length > 0 ? foods[0] : null;
  } catch (err) {
    console.error('USDA searchFood failed:', err.message);
    return null;
  }
}

/**
 * 2) Obtaining nutritional information by FDC ID
 * @param {number|string} fdcId
 * @returns {Promise<Object>} The complete object with the foodNutrients field (array)
 */
async function getFoodDetails(fdcId) {
  try {
    const resp = await axios.get(`${BASE_URL}/food/${fdcId}`, {
      params: { api_key: USDA_API_KEY }
    });
    return resp.data;  // Inside this is resp.data.foodNutrients as an array of objects
  } catch (err) {
    console.error('USDA getFoodDetails failed:', err.message);
    // Returns a correct structure even when there is an error, so as not to crash
    return { foodNutrients: [] };
  }
}

module.exports = {
  searchFood,
  getFoodDetails
};
