const express = require('express');
const router = express.Router();
const service = require('../services/onlineResumeService');


// 创建在线简历接口
router.post('/createOnlineResume', service.createOnlineResume);

// 更新在线简历接口
router.put('/updateOnlineResume', service.updateOnlineResume);

// 查询在线简历接口
router.get('/queryOnlineResume', service.queryOnlineResume);

module.exports = router;
