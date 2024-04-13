const {querySql,queryOne} = require('../utils/mysql-dbHelper');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const { validationResult } = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS,
    PRIVATE_KEY,
    JWT_EXPIRED
} = require('../utils/config');
const { decode } = require('../utils/user-jwt');


// 根据简历查询推荐职业
async function queryJobCategory(req, res, next) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{ msg }] = err.errors;
        next(boom.badRequest(msg));
    } else {
        const decodedToken = decode(req);
        const { username } = decodedToken;
        const sql = `select * from online_resumes where username='${username}'`;
        let result;
        try {
            result = await queryOne(sql);
        } catch (e) {
            res.json({
                code: CODE_ERROR,
                msg: '查询失败',
                data: null
            })
            console.error(e)
        }
        if (!result) {
            // 未提交简历则要求先提交简历
            res.json({
                code: CODE_ERROR,
                msg: '请先提交简历',
                data: null
            })
        } else {

        }
    }
}


// 添加职位
async function addJob(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{ msg }] = err.errors;
            next(boom.badRequest(msg));
        } else {
            const { name, company, salary, address, logo, position, experience, education, type, description } = req.body;
            const user = decode(req);
            const userId = user.id;
            const sql = `insert into job (name, company, salary, address, logo, position, experience, education, type, description, userId) values('${name}', '${company}', '${salary}', '${address}', '${logo}', '${position}', '${experience}', '${education}', '${type}', '${description}', '${userId}')`;
            await querySql(sql);
            res.json({
                code: CODE_SUCCESS,
                msg: '职位发布成功',
                data: null
            })
        }
    } catch (e) {
        console.error('addJob', e);
        next(boom.badImplementation(e));
    }
}

module.exports = {
    addJob
}
