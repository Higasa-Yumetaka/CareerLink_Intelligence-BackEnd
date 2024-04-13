const express = require('express');
const jtw = require('express-jwt');
const boom = require('boom');
const { validationResult } = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS
} = require('../utils/config');
const {
    PROTOCOL,
    HOST,
    PORT,
    NEO4J_URL
} = require('../utils/config').neo4j;
const { decode } = require('../utils/user-jwt');
async function queryNeo4j(req, res, next) {

    console.debug('queryNeo4j')

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const [{ msg }] = errors.array();
        console.error(msg);
        res.json({ code: CODE_ERROR, msg });
    } else {
        // 向NEO4J_URL发送请求
        const { entity_name } = req.query;
        const url = `${PROTOCOL}://${HOST}:${PORT}${NEO4J_URL}`;
        console.debug('url', url)
        const data = { entity_name:`${entity_name}`}
        console.debug('data',JSON.stringify(data))
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            res.json({
                code: CODE_SUCCESS,
                msg: '查询成功',
                data: result
            })
        } catch (e) {
            console.error(e);
            res.json({
                code: CODE_ERROR,
                msg: '查询失败',
                data:{
                    e
                }
            })
        }
    }
}


module.exports = {
    queryNeo4j
}


