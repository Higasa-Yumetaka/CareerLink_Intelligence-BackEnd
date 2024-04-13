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
const { decode } = require('../utils/user-jwt');

async function addComment(req, res, next) {
    const { stars, comment, jobId } = req.body;
    if (!stars || !comment || !jobId) {
        res.json({
            code: CODE_ERROR,
            msg: '参数不完整',
            data: null
        })
        return
    } else if (stars < 1 || stars > 5) {
        res.json({
            code: CODE_ERROR,
            msg: '评分不正确',
            data: null
        })
        return
    }
    const decodedToken = decode(req);
    const { username } = decodedToken;
    const sql = `select * from comments where username='${username}' and jobId='${jobId}'`;
    const result = await queryOne(sql);
    if (result) {
        res.json({
            code: CODE_ERROR,
            msg: '您已经评论过了'
        })
    } else {
        const addSql = `insert into comments (username, comment, jobId, stars) values('${username}', '${comment}', '${jobId}', ${stars})`;
        try {
            await querySql(addSql);
            res.json({
                code: CODE_SUCCESS,
                msg: '评论成功',
                data: null
            })
        } catch (e) {
            res.json({
                code: CODE_ERROR,
                msg: '评论失败',
                data: null
            })
        }
    }
}

async function getComments(req, res, next) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{ msg }] = err.errors;
        next(boom.badRequest(msg));
    } else {
        let { jobId, pageSize, pageNo, own } = req.body;
        if (!jobId) {
            res.json({
                code: CODE_ERROR,
                msg: 'jobId缺失',
                data: {
                    rows: [],
                    total: 0,
                    pageNo: parseInt(pageNo),
                    pageSize: parseInt(pageSize),
                    own:parseInt(own)
                }
            })
            return
        }
        pageSize = pageSize ? parseInt(pageSize) : 10;
        pageNo = pageNo ? parseInt(pageNo) : 1;
        own = own ? own : null;
        const decodedToken = decode(req);
        const { username } = decodedToken;
        let query;
        if (own) {
            query = `select * from comments d where jobId=${jobId} and username='${username}'`;
        }
        else {
            query = `select * from comments d where jobId=${jobId}`;
        }
        let result;
        try {
            result = await querySql(query);
        } catch (e) {
            console.error(e);
            res.json({
                code: CODE_ERROR,
                msg: '查询失败',
                data: {
                    rows: [],
                    total: 0,
                    pageNo: parseInt(pageNo),
                    pageSize: parseInt(pageSize),
                    own:parseInt(own)
                }
            })
        }
        if (!result || result.length === 0) {
            res.json({
                code: CODE_SUCCESS,
                msg: '暂无评论',
                data: {
                    rows: [],
                    total: 0,
                    pageNo: parseInt(pageNo),
                    pageSize: parseInt(pageSize),
                    own:parseInt(own)
                }
            })
        } else {
            let total = result.length;
            let n = (pageNo - 1) * pageSize;
            let query_1, result_1;
            query_1 = query + ` order by d.gmt_create desc limit ${n}, ${pageSize}`;
            try {
                result_1 = await querySql(query_1);
            } catch (e) {
                console.error(e);
                res.json({
                    code: CODE_ERROR,
                    msg: '查询失败',
                    data: null
                })
            }
            //result_1 = await querySql(query_1);
            if (!result_1 || result_1.length === 0) {
                res.json({
                    code: CODE_SUCCESS,
                    msg: '暂无评论',
                    data: null
                })
            } else {
                res.json({
                    code: CODE_SUCCESS,
                    msg: '查询成功',
                    data: {
                        rows: result_1,
                        total: total,
                        pageNo: parseInt(pageNo),
                        pageSize: parseInt(pageSize),
                        own:parseInt(own)
                    }
                })
            }
        }
    }
}

async function getAverageStars(req, res, next) {
    const { jobId } = req.body;
    if (!jobId) {
        res.json({
            code: CODE_ERROR,
            msg: 'jobId缺失',
            data: null
        })
        return
    }
    const query = `select avg(stars) as avg from comments where jobId=${jobId}`;
    let result;
    try {
        result = await queryOne(query);
    } catch (e) {
        console.error(e);
        res.json({
            code: CODE_ERROR,
            msg: '查询失败',
            data: null
        })
    }
if (!result || !result.avg) {
        res.json({
            code: CODE_SUCCESS,
            msg: '暂无评分',
            data: null
        })
    } else {
        res.json({
            code: CODE_SUCCESS,
            msg: '查询成功',
            data: {
                average_stars: result.avg
            }
        })
    }
}

module.exports = {
    addComment,
    getComments,
    getAverageStars
}