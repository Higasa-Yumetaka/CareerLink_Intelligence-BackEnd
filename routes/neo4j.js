const express = require('express');
const router = express.Router();
const service = require('../services/neo4jService');

router.get('/queryNeo4j', service.queryNeo4j);

module.exports = router;