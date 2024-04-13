const express = require('express');
const router = express.Router();
const service = require('../services/areaService');

// 查询地区接口
router.get('/queryArea', service.queryArea);


// 查询下级地区接口
router.get('/querySubordinateArea', service.querySubordinateArea);


module.exports = router;