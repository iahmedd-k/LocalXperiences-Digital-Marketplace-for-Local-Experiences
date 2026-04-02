const axios = require('axios');

const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/`;

/**
 * Get currency exchange rates for a base currency
 * @param {string} baseCurrency - e.g. 'USD', 'EUR'
 * @returns {Promise<object>} - Exchange rates object
 */
async function getExchangeRates(baseCurrency = 'USD') {
  try {
    const url = `${EXCHANGE_API_URL}${baseCurrency}`;
    const response = await axios.get(url, { timeout: 8000 });
    if (response.data && response.data.result === 'success') {
      return response.data;
    }
    throw new Error('Failed to fetch exchange rates');
  } catch (err) {
    console.error('Currency exchange error:', err?.response?.data || err.message);
    throw new Error('Currency exchange API error');
  }
}

module.exports = { getExchangeRates };
