const express = require('express');
const router = express.Router();
const service = require('../services/visualDataService');

router.get('/queryVisualData', service.queryVisualData);

module.exports = router;
