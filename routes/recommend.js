const express = require('express');
const router = express.Router();
const service = require('../services/recommendService');

router.get('/queryRecommendCategory', service.queryRecommendCategory);

router.get('/queryRecommendProfession', service.queryRecommendProfession);

module.exports = router;