const express = require('express');
const router = express.Router();
const service = require('../services/commentService');

// 评论列表接口
router.get('/queryCommentList', service.getComments);

// 添加评论接口
router.post('/addComment', service.addComment);

// 平均分接口
router.get('/queryAvgStars', service.getAverageStars);

// 删除评论接口
//router.delete('/deleteComment', service.deleteComment);

module.exports = router;
