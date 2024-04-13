const { querySql, queryOne } = require('../utils/mysql-dbHelper');
const boom = require('boom');
const { validationResult } = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS
} = require('../utils/config');
const { decode } = require('../utils/user-jwt');

async function createJob(req, res) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{msg}] = err.errors;
        // throw boom.badRequest(msg);
        console.error(msg);
    } else {
        //console.info('req.body', req.body)
        const {
            company_name,
            location,
            category,
            job_name,
            min_salary,
            max_salary,
            education,
            experience,
            description,
            requirement
        } = req.body;
        const decodedToken = decode(req);
        const {username} = decodedToken;
        const sql = `select * from jobs where username='${username}'`;
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
        if (result) {
            res.json({
                code: CODE_ERROR,
                msg: '您已经提交过了',
                data: {
                    username: result.username
                }
            })
        } else {
            let addSql = `INSERT INTO jobs (username`;
            let valueSql = `VALUES ('${username}'`;
            if (company_name) {
                addSql += `, company_name`;
                valueSql += `, '${company_name}'`;
            }
            if (location) {
                addSql += `, location`;
                valueSql += `, '${location}'`;
            }
            if (category) {
                addSql += `, category`;
                valueSql += `, '${category}'`;
            }
            if (job_name) {
                addSql += `, job_name`;
                valueSql += `, '${job_name}'`;
            }
            if (min_salary) {
                addSql += `, min_salary`;
                valueSql += `, '${min_salary}'`;
            }
            if (max_salary) {
                addSql += `, max_salary`;
                valueSql += `, '${max_salary}'`;
            }
            if (education) {
                addSql += `, education`;
                valueSql += `, '${education}'`;
            }
            if (experience) {
                addSql += `, experience`;
                valueSql += `, '${experience}'`;
            }
            if (description) {
                addSql += `, description`;
                valueSql += `, '${description}'`;
            }
            if (requirement) {
                addSql += `, requirement`;
                valueSql += `, '${requirement}'`;
            }
            addSql += `)`;
            valueSql += `)`;
            let sql = addSql + valueSql;
            try {
                await querySql(sql);
                res.json({
                    code: CODE_SUCCESS,
                    msg: '提交成功',
                    data: null
                })
            } catch (e) {
                res.json({
                    code: CODE_ERROR,
                    msg: '提交失败',
                    data: null
                })
                console.error(e);
            }
        }
    }
}


async function updateJob(req, res){
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{msg}] = err.errors;
        // throw boom.badRequest(msg);
        console.error(msg);
    } else {
        let {
            company_name,
            location,
            category,
            job_name,
            min_salary,
            max_salary,
            education,
            experience,
            description,
            requirement
        } = req.body;
        const decodedToken = decode(req);
        const {username} = decodedToken;
        let addSql = `UPDATE jobs SET `;
        let valueSql = '';
        if (company_name) {
            valueSql += `company_name='${company_name}', `;
        }
        if (location) {
            valueSql += `location='${location}', `;
        }
        if (category) {
            valueSql += `category='${category}', `;
        }
        if (job_name) {
            valueSql += `job_name='${job_name}', `;
        }
        if (min_salary) {
            valueSql += `min_salary='${min_salary}', `;
        }
        if (max_salary) {
            valueSql += `max_salary='${max_salary}', `;
        }
        if (education) {
            valueSql += `education='${education}', `;
        }
        if (experience) {
            valueSql += `experience='${experience}', `;
        }
        if (description) {
            valueSql += `description='${description}', `;
        }
        if (requirement) {
            valueSql += `requirement='${requirement}', `;
        }
        valueSql = valueSql.substring(0, valueSql.length - 2);
        addSql += valueSql;
        addSql += ` WHERE username='${username}'`;
        try {
            await querySql(addSql);
            res.json({
                code: CODE_SUCCESS,
                msg: '更新成功',
                data: null
            })
        } catch (e) {
            res.json({
                code: CODE_ERROR,
                msg: '更新失败',
                data: null
            })
            console.error(e);
        }
    }
}

async function queryJob(req, res) {
    const decodedToken = decode(req);
    const { username } = decodedToken;
    const sql = `select * from jobs where username='${username}'`;
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
        res.json({
            code: CODE_ERROR,
            msg: '您还未发布招聘信息！',
            data: {
                username: username
            }
        })
    } else {
        res.json({
            code: CODE_SUCCESS,
            msg: '查询成功',
            data: result
        })
    }
}

module.exports = {
    createJob,
    updateJob,
    queryJob
}