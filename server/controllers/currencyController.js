const { getExchangeRates } = require('../services/currencyService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @GET /api/currency/:base
// Returns exchange rates for the given base currency
const getCurrencyRates = async (req, res, next) => {
  try {
    const base = (req.params.base || 'USD').toUpperCase();
    const data = await getExchangeRates(base);
    return successResponse(res, 200, 'Exchange rates fetched', data);
  } catch (err) {
    return errorResponse(res, 500, err.message || 'Failed to fetch exchange rates');
  }
};

module.exports = { getCurrencyRates };
