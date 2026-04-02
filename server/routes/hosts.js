const express = require('express');
const router = express.Router();
const { getPublicHostProfile } = require('../controllers/hostController');

router.get('/:id', getPublicHostProfile);

module.exports = router;
