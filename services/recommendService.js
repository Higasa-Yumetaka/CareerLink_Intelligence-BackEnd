const { querySql, queryOne } = require('../utils/mysql-dbHelper');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const { validationResult } = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS,
    PRIVATE_KEY,
    JWT_EXPIRED
} = require('../utils/config');
const {
    PROTOCOL,
    HOST,
    CATEGORY_PORT,
    CATEGORY_PATH,
    PROFESSION_PORT,
    PROFESSION_PATH
} = require('../utils/config').recommand;
const { decode } = require('../utils/user-jwt');


async function queryRecommendCategory(req, res, next) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{ msg }] = err.errors;

        //next(boom.badRequest(msg));
        res.json({ code: CODE_ERROR, msg });
        console.error(msg);
        return;
    }
    const decodedToken = decode(req);
    const { username } = decodedToken;
    const sql = `select d.self_introduction from online_resumes d where username='${username}'`;
    let result;
    try {
        result = await queryOne(sql);
    } catch (e) {
        //next(boom.badRequest(e));
        res.json({ code: CODE_ERROR, msg: e });
        console.error(e);
    }
    if (!result) {
        // 未提交简历则要求先提交简历
        //next(boom.badRequest('请先提交简历'));
        res.json({ code: CODE_ERROR, msg: '请先提交简历' });
    } else {
        const url = `${PROTOCOL}://${HOST}:${CATEGORY_PORT}${CATEGORY_PATH}`;
        const resume = (result.self_introduction)
            //.replace(/[{}":\n]/g, '');
        const resumeObj = JSON.parse(resume);
        const introduction = resumeObj.introduction;
        //console.debug('resume', introduction)
        const data = { resume_text: `${introduction}` }
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            res.json(result);
        } catch (e) {
            res.json({ code: CODE_ERROR, msg: e });
            console.error(e);
        }
    }
}


// 推荐职业
async function queryRecommendProfession(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const [{ msg }] = errors.array();
        console.error(msg);
        res.json({ code: CODE_ERROR, msg });
    } else {
        // 业务部分
        // 返回推荐职业
        const { type } = req.body;
        const url = `${PROTOCOL}://${HOST}:${CATEGORY_PORT}${CATEGORY_PATH}`;
        const decodedToken = decode(req);
        const { username } = decodedToken;
        const querySql = `select d.expected_salary from online_resumes d where username='${username}'`;
        try {
            const result = await queryOne(querySql);
            if (!result) {
                res.json({ code: CODE_ERROR, msg: '请先提交简历' });
            } else {
                const { category_name } = req.query;
                const max_salary = JSON.parse(result.expected_salary).max_salary
                const min_salary = JSON.parse(result.expected_salary).min_salary
                const url = `${PROTOCOL}://${HOST}:${PROFESSION_PORT}${PROFESSION_PATH}?category_name=${category_name}&user_max_salary=${max_salary}&user_min_salary=${min_salary}`;
                // 使用params/get请求
                const data = { category_name, max_salary, min_salary };
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        //params: data
                    });
                    const result = await response.json();
                    res.json(result);
                } catch (e) {
                    res.json({ code: CODE_ERROR, msg: e });
                    console.error(e);
                    }
            }
        } catch (e) {
            res.json({ code: CODE_ERROR, msg: e });
            console.error(e);
        }
    }
}

module.exports = {
    queryRecommendProfession,
    queryRecommendCategory
}