const express = require('express');
const router = express.Router();
const service = require('../services/modelServive');

router.post('/uploadModel', service.uploadModel);
router.get('/queryModelInfo', service.queryModelInfo);
router.get('/queryModelList', service.queryModelList);
router.post('/downloadModel', service.downloadModel);

module.exports = router;
