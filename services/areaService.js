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

/**
 * Query for subordinate areas based on the parent ID.
 *
 * @param {Object} req - The request object, should contain a query parameter 'parentId'.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
async function querySubordinateArea(req, res, next) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{msg}] = err.errors;
        next(boom.badRequest(msg));
    } else {
        let {parentId} = req.query;
        parentId = String(parentId)
        parentId = parentId ? parentId : null;
        if (parentId !== "undefined") {
            const sql = `select * from dou_area where parent_id='${parentId}'`;
            try {
                const result = await querySql(sql);
                if (result.length === 0) {
                    res.json({
                        code: 2,
                        msg: '无下属行政区',
                        data: null
                    })
                } else {
                    //console.log("查询地区success")
                    res.json({
                        code: CODE_SUCCESS,
                        msg: '查询成功',
                        data: result
                    })
                }
            } catch (e) {
                console.error("Error in queryArea", e);
                res.json({
                    code: CODE_ERROR,
                    msg: '未知错误，请联系管理员',
                    data: {
                        error: e
                    }
                })
            }
        } else {
            //console.log("参数不完整：parentId", parentId)
            res.json({
                code: CODE_ERROR,
                msg: '参数不完整：parentId',
                data: null
            })
        }
    }
}

/**
 * Query for an area based on the area ID.
 *
 * @param {Object} req - The request object, should contain a query parameter 'areaId'.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
async function queryArea(req, res, next) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{msg}] = err.errors;
        next(boom.badRequest(msg));
    } else {
        const { areaId } = req.query;
        const sql = `select * from dou_area where area_id='${areaId}'`;
        try {
            const result = await querySql(sql);
            if (result.length === 0) {
                res.json({
                    code: 0,
                    msg: '无行政区',
                    data: null
                })
            } else {
                res.json({
                    code: CODE_SUCCESS,
                    msg: '查询成功',
                    data: result
                })
            }
        } catch (e) {
            console.log("Error in queryArea", e);
            res.json({
                code: CODE_ERROR,
                msg: '未知错误，请联系管理员',
                data: {
                    error: e
                }
            })
        }
    }
}

module.exports = {
    querySubordinateArea,
    queryArea
}