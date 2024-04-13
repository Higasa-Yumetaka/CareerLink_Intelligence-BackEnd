const express = require('express');
const router = express.Router();
const service = require('../services/datasetServive');

router.post('/uploadDataset', service.uploadModel);
router.get('/queryDatasetInfo', service.queryDatasetInfo);
router.get('/queryDatasetList', service.queryModelList);
router.post('/downloadDataset', service.downloadModel);

module.exports = router;
