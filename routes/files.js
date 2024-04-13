const express = require('express');
const router = express.Router();
const service = require('../services/fileService');

router.post('/uploadFile', service.uploadFile);
router.post('/queryFileList', service.queryFileList);
router.post('/downloadFile', service.downloadFile);

module.exports = router;
