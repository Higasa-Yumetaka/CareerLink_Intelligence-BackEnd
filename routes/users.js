const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const service = require('../services/userService');


// 类型校验
// 登录注册校验
const vaildator = [
    body('username').isString().withMessage('用户名类型错误'),
    body('password').isString().withMessage('密码类型错误')
]

// 重置密码校验
const resetPwdVaildator = [
    body('username').isString().withMessage('用户名类型错误'),
    body('oldPassword').isString().withMessage('密码类型错误'),
    body('newPassword').isString().withMessage('密码类型错误')
]

// 用户登录路由
router.post('/login', vaildator, service.login);

// 用户注册路由
router.post('/register', service.register);

// 密码重置路由
router.post('/resetPwd', resetPwdVaildator, service.resetPwd);

// 获取用户信息路由(token/header)
router.get('/getUserInfo', service.getUserInfo);

// 获取用户信息路由(token/params)
router.get('/getUserInfoByParams', service.getUserInfoByParams);

// 更新用户信息路由
router.post('/updateUserInfo', service.updateUserInfo);

module.exports = router;
