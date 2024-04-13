const { querySql, queryOne } = require('../utils/mysql-dbHelper');
require('jsonwebtoken');
require('multer');
const boom = require('boom');
const { validationResult } = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS
} = require('../utils/config');
const { decode } = require('../utils/user-jwt');

async function createOnlineResume(req, res) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{ msg }] = err.errors;
        // throw boom.badRequest(msg);
        console.error(msg);
    } else {
        const { education, college, campus_experience, intern_experience, project_experience, training_experience, receive_honor, related_works, skills_and_specialties, self_introduction, area, expected_salary, intended_job } = req.body;
        //console.info('req.body', req.body)
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
        if (result) {
            res.json({
                code: CODE_ERROR,
                msg: '您已经提交过了',
                data: {
                    username: result.username
                }
            })
        } else {
            let addSql = `INSERT INTO online_resumes (username`;
            let valueSql = `VALUES ('${username}'`;
            if (education !== undefined) {
                addSql += `, education`;
                valueSql += `, '${education}'`;
            }
            if (college !== undefined) {
                addSql += `, college`;
                valueSql += `, '${college}'`;
            }
            if (campus_experience !== undefined) {
                addSql += `, campus_experience`;
                valueSql += `, '${campus_experience}'`;
            }
            if (intern_experience !== undefined) {
                addSql += `, intern_experience`;
                valueSql += `, '${intern_experience}'`;
            }
            if (project_experience !== undefined) {
                addSql += `, project_experience`;
                valueSql += `, '${project_experience}'`;
            }
            if (training_experience !== undefined) {
                addSql += `, training_experience`;
                valueSql += `, '${training_experience}'`;
            }
            if (receive_honor !== undefined) {
                addSql += `, receive_honor`;
                valueSql += `, '${receive_honor}'`;
            }
            if (related_works !== undefined) {
                addSql += `, related_works`;
                valueSql += `, '${related_works}'`;
            }
            if (skills_and_specialties !== undefined) {
                addSql += `, skills_and_specialties`;
                valueSql += `, '${skills_and_specialties}'`;
            }
            if (self_introduction !== undefined) {
                addSql += `, self_introduction`;
                valueSql += `, '${self_introduction}'`;
            }
            if (area !== undefined) {
                addSql += `, area`;
                valueSql += `, '${area}'`;
            }
            if (expected_salary !== undefined) {
                addSql += `, expected_salary`;
                valueSql += `, '${expected_salary}'`;
            }
            if (intended_job !== undefined) {
                addSql += `, intended_job`;
                valueSql += `, '${intended_job}'`;
            }
            addSql += ')';
            valueSql += ')';
            addSql += valueSql;
            try {
                await querySql(addSql);
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


async function updateOnlineResume(req, res) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{ msg }] = err.errors;
        // throw boom.badRequest(msg);
        console.error(msg);
    } else {
        let { education, college, campus_experience, intern_experience, project_experience, training_experience, receive_honor, related_works, skills_and_specialties, self_introduction, area, expected_salary, intended_job } = req.body;
        //console.log('req.body', req.body)
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
            res.json({
                code: CODE_ERROR,
                msg: '您还未创建在线简历！',
                data: {
                    username: username
                }
            })
        } else {
            const baseSql = `UPDATE online_resumes SET`;
            let updateSql = '';
            if (education !== undefined) {
                updateSql += ` education='${education}',`;
            }
            if (college !== undefined) {
                updateSql += ` college='${college}',`;
            }
            if (campus_experience !== undefined) {
                updateSql += ` campus_experience='${campus_experience}',`;
            }
            if (intern_experience !== undefined) {
                updateSql += ` intern_experience='${intern_experience}',`;
            }
            if (project_experience !== undefined) {
                updateSql += ` project_experience='${project_experience}',`;
            }
            if (training_experience !== undefined) {
                updateSql += ` training_experience='${training_experience}',`;
            }
            if (receive_honor !== undefined) {
                updateSql += ` receive_honor='${receive_honor}',`;
            }
            if (related_works !== undefined) {
                updateSql += ` related_works='${related_works}',`;
            }
            if (skills_and_specialties !== undefined) {
                updateSql += ` skills_and_specialties='${skills_and_specialties}',`;
            }
            if (self_introduction !== undefined) {
                updateSql += ` self_introduction='${self_introduction}',`;
            }
            if (area !== undefined) {
                updateSql += ` area='${area}',`;
            }
            if (expected_salary !== undefined) {
                updateSql += ` expected_salary='${expected_salary}',`;
            }
            if (intended_job !== undefined) {
                updateSql += ` intended_job='${intended_job}',`;
            }
            updateSql = updateSql.substring(0, updateSql.length - 1);
            updateSql += ` WHERE username='${username}'`;
            const addSql = baseSql + updateSql;
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
}

async function queryOnlineResume(req, res) {
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
        res.json({
            code: CODE_ERROR,
            msg: '您还未创建在线简历！',
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
    createOnlineResume,
    updateOnlineResume,
    queryOnlineResume
}
