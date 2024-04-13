const express = require('express');
const userRouter = require('./users');
const taskRouter = require('./tasks'); // 引入task路由模块
const fileRouter = require('./files'); // 引入文件路由模块
const commentRouter = require('./comment');
const onlineResumeRouter = require('./onlineResume');
const areaRouter = require('./area');
const visualDataRouter = require('./visualData');
const neo4jRouter = require('./neo4j');
const recommendRouter = require('./recommend');
const modelRouter = require('./models');
const datasetRouter = require('./datasets');
const jobRouter = require('./jobs');

const { verifyToken, decode } = require('../utils/user-jwt');
const {datasets} = require("../utils/config"); // 引入jwt认证函数
const router = express.Router(); // 注册路由

router.use(verifyToken); // 注入认证模块

router.use('/api', userRouter); // 注入用户路由模块
router.use('/api', taskRouter); // 注入任务路由模块
router.use('/api', fileRouter); // 注入文件路由模块
router.use('/api', modelRouter);
router.use('/api', datasetRouter);
router.use('/api', commentRouter); // 注入评论路由模块
router.use('/api', onlineResumeRouter); // 注入在线简历路由模块
router.use('/api', areaRouter); // 注入地区路由模块
router.use('/api', visualDataRouter); // 注入可视化数据路由模块
router.use('/api', neo4jRouter); // 注入neo4j路由模块
router.use('/api', recommendRouter); // 注入推荐路由模块
router.use('/api', jobRouter); // 注入职位路由模块


// 异常处理中间件
router.use((err, req, res, next) => {
    // 用户认证失败的错误返回
    console.error('err===', err);
    if (err && err.name === 'UnauthorizedError') {
        // 抛出401异常
        const { status = 401, message } = err;
        res.status(status).json({
            code: status,
            msg: 'token失效，请重新登录',
            data: null
        })
    } else {
        const { output } = err || {};
        const errCode = (output && output.statusCode) || 500;
        const errMsg = (output && output.payload && output.payload.error) || err.message;
        res.status(errCode).json({
            code: errCode,
            msg: errMsg
        })
    }
})

module.exports = router;
