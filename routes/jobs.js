const express = require('express');
const router = express.Router();
const service = require('../services/jobService');


router.post('/createJob', service.createJob);

router.put('/updateJob', service.updateJob);

router.get('/queryJob', service.queryJob);

module.exports = router;
