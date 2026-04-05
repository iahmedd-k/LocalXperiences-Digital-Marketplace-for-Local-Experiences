const axios = require('axios');

const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/`;
const EXCHANGE_CACHE_TTL_MS = Number.parseInt(process.env.EXCHANGE_CACHE_TTL_MS, 10) || 1000 * 60 * 60 * 6;
const exchangeRateCache = new Map();

const getCachedRates = (baseCurrency) => {
  const cacheKey = String(baseCurrency || 'USD').toUpperCase();
  const cachedEntry = exchangeRateCache.get(cacheKey);

  if (!cachedEntry) return null;

  return {
    cacheKey,
    data: cachedEntry.data,
    isFresh: Date.now() - cachedEntry.cachedAt < EXCHANGE_CACHE_TTL_MS,
  };
};

const setCachedRates = (baseCurrency, data) => {
  exchangeRateCache.set(String(baseCurrency || 'USD').toUpperCase(), {
    data,
    cachedAt: Date.now(),
  });
};

/**
 * Get currency exchange rates for a base currency
 * @param {string} baseCurrency - e.g. 'USD', 'EUR'
 * @returns {Promise<object>} - Exchange rates object
 */
async function getExchangeRates(baseCurrency = 'USD') {
  const normalizedBaseCurrency = String(baseCurrency || 'USD').toUpperCase();
  const cachedEntry = getCachedRates(normalizedBaseCurrency);

  if (cachedEntry?.isFresh) {
    return cachedEntry.data;
  }

  try {
    const url = `${EXCHANGE_API_URL}${normalizedBaseCurrency}`;
    const response = await axios.get(url, { timeout: 8000 });

    if (response.data && response.data.result === 'success') {
      setCachedRates(normalizedBaseCurrency, response.data);
      return response.data;
    }

    throw new Error('Failed to fetch exchange rates');
  } catch (err) {
    console.error('Currency exchange error:', err?.response?.data || err.message);

    if (cachedEntry?.data) {
      return cachedEntry.data;
    }

    throw new Error('Currency exchange API error');
  }
}

module.exports = { getExchangeRates };
