const express = require('express');
const router = express.Router();

const { getCurrencyRates } = require('../controllers/currencyController');

// GET /api/currency/:base
router.get('/:base', getCurrencyRates);

module.exports = router;
