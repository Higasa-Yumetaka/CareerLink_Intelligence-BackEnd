const {querySql, queryOne} = require('../utils/mysql-dbHelper');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const {validationResult} = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS,
    PRIVATE_KEY,
    JWT_EXPIRED
} = require('../utils/config');
const generateRate  = require('../utils/gen_rate');
const generateScore  = require('../utils/gen_score');
const {decode} = require('../utils/user-jwt');


// 查询任务列表
async function queryTaskList(req, res, next) {
    try {
        const err = validationResult(req);
        // 如果验证错误，empty不为空
        if (!err.isEmpty()) {
            // 获取错误信息
            const [{msg}] = err.errors;
            // 抛出错误
            res.json({
                code: CODE_ERROR,
                msg: msg,
                data: null
            });
        } else {
            let {pageSize, pageNo, status, own} = req.query;
            // 默认值
            //console.log('pageSize===', pageSize);
            pageSize = pageSize ? pageSize : 10;
            pageNo = pageNo ? pageNo : 1;
            status = (status || status === 0) ? status : null;
            // 是否查询自己的任务
            //console.log('own===', own);
            own = own ? own : null;
            let {username} = decode(req);

            //console.log('queryTaskList:', username, pageSize, pageNo, status, own);

            let query;
            if (own) {
                //console.log('own===', own);
                query = `select d.id, d.title, d.content, d.status, d.is_major, d.gmt_create, d.gmt_expire, d.username from tasks d where username='${username}'`;
            } else {
                //console.log('own===', own);
                query = `select d.id, d.title, d.content, d.status, d.is_major, d.gmt_create, d.gmt_expire, d.username from tasks d`;
            }
            let data;
            try{
                data = await querySql(query);
            } catch (e) {
                console.error(e);
            }
            if (!data || data.length === 0) {
                return res.json({
                    code: CODE_ERROR,
                    msg: '暂无数据',
                    data: null
                });
            }

            let total = data.length;
            let n = (pageNo - 1) * pageSize;
            let query_1, result_1;

            if (status) {
                if (own) {
                    query_1 = `select d.id, d.title, d.content, d.status, d.is_major, d.gmt_create, d.gmt_expire, d.username from tasks d where status='${status}' and username='${username}' order by d.gmt_create desc`;
                } else {
                    query_1 = `select d.id, d.title, d.content, d.status, d.is_major, d.gmt_create, d.gmt_expire, d.username from tasks d where status='${status}' order by d.gmt_create desc`;
                }
                result_1 = await querySql(query_1);
            }

            let result_2;

            if (status && (!result_1 || result_1.length === 0)) {
                return res.json({
                    code: CODE_SUCCESS,
                    msg: '暂无数据',
                    data: null
                });
            } else if (status && result_1.length > 0) {
                let query_2 = query_1 + ` limit ${n} , ${pageSize}`;
                result_2 = await querySql(query_2);
            } else {
                let query_3 = query + ` order by d.gmt_create desc limit ${n} , ${pageSize}`;
                result_2 = await querySql(query_3);
            }

            if (!result_2 || result_2.length === 0) {
                return res.json({
                    code: CODE_SUCCESS,
                    msg: '暂无数据',
                    data: null
                });
            }

            res.json({
                code: CODE_SUCCESS,
                msg: '查询数据成功',
                data: {
                    rows: result_2,
                    total: status ? result_1.length : total,
                    pageNo: parseInt(pageNo),
                    pageSize: parseInt(pageSize),
                    own: parseInt(own)
                }
            });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '查询数据失败',
            data: null
        });
    }
}

async function queryTaskInfo(req, res, next) {
    try {
        const err = validationResult(req);
        // 如果验证错误，empty不为空
        if (!err.isEmpty()) {
            // 获取错误信息
            const [{msg}] = err.errors;
            // 抛出错误
            res.json({
                code: CODE_ERROR,
                msg: msg,
                data: null
            });
        } else {
            let {task_id} = req.query;
            if (!task_id) {
                return res.json({
                    code: CODE_ERROR,
                    msg: '缺失参数：task_id',
                    data: null
                });
            }
            let query = `select * from tasks where id='${task_id}'`;
            try {
                const data = await querySql(query);
                if (!data || data.length === 0) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '暂无数据',
                        data: null
                    });
                } else {
                    return res.json({
                        code: CODE_SUCCESS,
                        msg: '查询数据成功',
                        data: data
                    });
                }
            } catch (e) {
                console.error(e);
                res.json({
                    code: CODE_ERROR,
                    msg: '查询失败',
                    data: null
                });
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '查询数据失败',
            data: null
        });
    }
}


// 添加任务
async function addTask(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{msg}] = err.errors;
            console.error('Error occurred:', msg)
            res.json({
                code: CODE_ERROR,
                msg: "添加数据失败",
                data: null
            });
        } else {
            let {title, content, operators} = req.body;
            let cookies = req.headers.cookie;
            const decodedToken = decode(req);
            const {username} = decodedToken;
            const task_result = await querySql(`select * from tasks where title='${title}' and username='${username}'`);
            if (task_result && task_result.length > 0) {
                return res.json({
                    code: CODE_ERROR,
                    msg: '你已有同名任务',
                    data: null
                });
            } else {
                let query = `insert into tasks(title, content, status,  username, operators) values('${title}', '${content}', 0, '${username}', '${operators}')`;
                let data = await querySql(query);
                if (!data || data.length === 0) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '添加数据失败',
                        data: null
                    });
                } else {
                    query = `select * from tasks where id='${data.insertId}'`;
                    data = await querySql(query);
                    return res.json({
                        code: CODE_SUCCESS,
                        msg: '添加数据成功',
                        data: data
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '添加数据失败',
            data: null
        });
    }
}


// 编辑任务
async function editTask(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{msg}] = err.errors;
            res.json({
                code: CODE_ERROR,
                msg: "编辑任务失败",
                data: null
            });
        } else {
            let {task_id, title, content, status, operators, model_id, dataset_id} = req.body;
            const task = await findTask(task_id, 2);
            if (task) {
                const result = await findTask(title, 1);
                if (result.count > 1) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '任务名称已存在',
                        data: null
                    });
                } else {
                    const query = `update tasks set title='${title}', content='${content}', status='${status}', operators='${operators}', model_id='${model_id}', dataset_id='${dataset_id}' where id='${task_id}'`;

                    const model_result = await querySql(`select * from models where id='${model_id}'`);
                    if (!model_result || model_result.length === 0) {
                        return res.json({
                            code: CODE_ERROR,
                            msg: '模型不存在',
                            data: null
                        });
                    }
                    const dataset_result = await querySql(`select * from datasets where id='${dataset_id}'`);
                    if (!dataset_result || dataset_result.length === 0) {
                        return res.json({
                            code: CODE_ERROR,
                            msg: '数据集不存在',
                            data: null
                        });
                    }
                    try{
                        const data = await querySql(query);
                        if (!data || data.length === 0) {
                            return res.json({
                                code: CODE_ERROR,
                                msg: '更新数据失败',
                                data: null
                            });
                        } else {
                            await generateTaskResult(req, res, next);
                            return res.json({
                                code: CODE_SUCCESS,
                                msg: '更新数据成功',
                                data: null
                            });
                        }
                    } catch (e) {
                        console.error(e);
                        res.json({
                            code: CODE_ERROR,
                            msg: '编辑任务失败',
                            data: null
                        });
                    }
                }
            } else {
                return res.json({
                    code: CODE_ERROR,
                    msg: '参数错误或数据不存在',
                    data: null
                });
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
}


async function generateTaskResult(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{msg}] = err.errors;
        } else {
            let { task_id } = req.body;
            const task = await findTask(task_id, 2);
            //console.log('task:', task)
            if (task && task.status==='2') {
                const query_1 = `select * from task_results where task_id='${task_id}'`;
                const data_1 = await querySql(query_1);
                if (!(data_1 && data_1.length > 0)) {
                    const count = Math.floor(Math.random() * 6) + 8;
                    //console.log('count:', count)
                    const rate = JSON.stringify(generateRate(count))
                    console.log('rate:', rate);
                    const score = JSON.stringify(generateScore(count));
                    console.log('score:', score);
                    const query_2 = `insert into task_results(task_id, error_rate, score, categories) values('${task_id}', ${rate}, ${score}, ${count})`;
                    //console.log('query_2:', query_2);
                    const result = await querySql(query_2);
                    if (result) {
                        const query_3 = `update tasks set status='10' where id='${task_id}'`;
                        const result_3 = await querySql(query_3);
                        console.log('result_3:', result_3);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

async function getTaskResult(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{msg}] = err.errors;
            return res.json({
                code: CODE_ERROR,
                msg: "查询数据失败",
                data: null
            });
        } else {
            let { task_id } = req.query;
            const task = await findTask(task_id, 2);
            if (task && task.status==='2') {
                const query = `select * from task_results where task_id='${task_id}'`;
                const data = await querySql(query);
                if (data && data.length > 0) {
                    return res.json({
                        code: CODE_SUCCESS,
                        msg: '查询数据成功',
                        data: data
                    });
                } else {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '暂无数据',
                        data: null
                    });
                }
            } else if (task&& task.status!=='2') {
                return res.json({
                    code: CODE_ERROR,
                    msg: '该任务未完成，暂无数据',
                    data: null
                });
            } else {
                return res.json({
                    code: CODE_ERROR,
                    msg: '参数错误或数据不存在',
                    data: null
                });
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
}


// 操作任务状态
async function updateTaskStatus(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{msg}] = err.errors;
            console.error('Error occurred:', msg)
            res.json({
                code: CODE_ERROR,
                msg: "操作数据失败",
                data: null
            });
        } else {
            let {id, status} = req.body;
            const task = await findTask(id, 2);
            if (task) {
                const query = `update tasks set status='${status}' where id='${id}'`;
                const data = await querySql(query);
                if (!data || data.length === 0) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '操作数据失败',
                        data: null
                    });
                } else {
                    return res.json({
                        code: CODE_SUCCESS,
                        msg: '操作数据成功',
                        data: null
                    });
                }
            } else {
                return res.json({
                    code: CODE_ERROR,
                    msg: '参数错误或数据不存在',
                    data: null
                });
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '操作任务状态失败，请稍后重试',
            data: null
        });
    }
}


// 标记
async function updateMark(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{msg}] = err.errors;
            console.error('Error occurred:', msg)
            res.json({
                code: CODE_ERROR,
                msg: "标记失败",
                data: null
            });
        } else {
            let {id, is_major} = req.body;
            const task = await findTask(id, 2);
            if (task) {
                const query = `update tasks set is_major='${is_major}' where id='${id}'`;
                const data = await querySql(query);
                if (!data || data.length === 0) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '操作数据失败',
                        data: null
                    });
                } else {
                    return res.json({
                        code: CODE_SUCCESS,
                        msg: '操作数据成功',
                        data: null
                    });
                }
            } else {
                return res.json({
                    code: CODE_ERROR,
                    msg: '参数错误或数据不存在',
                    data: null
                });
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '标记失败，请稍后重试',
            data: null
        });
    }
}


// 删除任务
async function deleteTask(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{msg}] = err.errors;
            // throw boom.badRequest(msg);
            console.error('Error occurred:', msg)
        } else {
            let {id, status} = req.body;
            const task = await findTask(id, 2);
            if (task) {
                const query = `update tasks set status='${status}' where id='${id}'`;
                // const query = `delete from tasks where id='${id}'`;
                const data = await querySql(query);
                if (!data || data.length === 0) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '删除数据失败',
                        data: null
                    });
                } else {
                    return res.json({
                        code: CODE_SUCCESS,
                        msg: '删除数据成功',
                        data: null
                    });
                }
            } else {
                return res.json({
                    code: CODE_ERROR,
                    msg: '数据不存在',
                    data: null
                });
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '删除任务失败，请稍后重试',
            data: null
        });
    }
}


// 通过任务名称或ID查询数据是否存在
function findTask(param, type) {
    let query = null;
    if (type === 1) { // 1:添加类型 2:编辑或删除类型
        query = `select * from tasks where title='${param}'`;
    } else {
        query = `select * from tasks where id='${param}'`;
    }
    return queryOne(query);
}

function findTaskId(param, type) {
    let query = null;
    if (type === 1) { // 1:添加类型 2:编辑或删除类型
        query = `select id, title from tasks where title='${param}'`;
    } else {
        query = `select id, title from tasks where id='${param}'`;
    }
    return queryOne(query);
}


module.exports = {
    queryTaskList,
    queryTaskInfo,
    addTask,
    editTask,
    getTaskResult,
    updateTaskStatus,
    updateMark,
    deleteTask
}