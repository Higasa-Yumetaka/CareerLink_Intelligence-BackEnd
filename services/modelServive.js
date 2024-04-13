

const multer = require('multer')
const { validationResult } = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS, models,

} = require('../utils/config');
const {
    FILE_STORAGE_PATH,
    FILE_UPLOAD_PATH,
} = require('../utils/config').file;
const {
    MODEL_PATH,
    MODEL_UPLOAD_PATH
} = require('../utils/config').models;

const { decode } = require('../utils/user-jwt');
const { querySql } = require("../utils/mysql-dbHelper");
const { storage } = require("../utils/storage");

function uploadModel(req, res, next) {
    try {
        const upload = multer({storage: storage(MODEL_UPLOAD_PATH)}).single('file');
        upload( req, res, function (err) {
            if (err) {
                console.error("Error occurred while upload model", err);
                res.json({
                    code: CODE_ERROR,
                    msg: '文件上传失败',
                    data: null
                });
            } else {
                if (!req.file) {
                    res.json({
                        code: CODE_ERROR,
                        msg: '请提供文件',
                        data: null
                    });
                    return;
                }
                const decodedToken = decode(req);
                const {username} = decodedToken;
                const filePath = MODEL_PATH +'/' + req.file.filename;
                try {
                    let { task_id, type, status, model_description } = req.body;

                    task_id = task_id ? task_id : 0;
                    model_description = model_description ? model_description : '';
                    status = status ? status : '0';
                    type = type ? type : '0';

                    const query = `insert into models (filename, origin_name, model_description, username, path, task_id, type, status ) values ('${req.file.filename}', '${req.file.originalname}','${model_description}', '${username}', '${filePath}', '${task_id}', '${type}', '${status}')`;
                    querySql(query)
                        .then(async data => {
                            if (data && data.insertId) {
                                const query_2 = `select * from models where id='${data.insertId}'`;
                                const data_2 = await querySql(query_2);
                                //console.log('data_2:', data_2);
                                res.json({
                                    code: CODE_SUCCESS,
                                    msg: '文件上传成功',
                                    data: data_2
                                });
                            } else {
                                res.json({
                                    code: CODE_ERROR,
                                    msg: '文件上传失败',
                                    data: null
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error executing SQL query:', error);
                            res.json({
                                code: CODE_ERROR,
                                msg: '文件上传失败',
                                data: null
                            });
                        });
                } catch (error) {
                    console.error('Error occurred:', error);
                    res.json({
                        code: CODE_ERROR,
                        msg: '文件上传失败',
                        data: null
                    });
                }
            }
        })
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '文件上传失败，请联系管理员',
            data: null
        });
    }
}

async function queryModelInfo(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{ msg }] = err.errors;
            res.json({
                code: CODE_ERROR,
                msg: msg,
                data: null
            });
        } else {
            let { model_id } = req.query;
            if (!model_id) {
                res.json({
                    code: CODE_ERROR,
                    msg: '参数缺失：model_id',
                    data: null
                });
                return ;
            }
            model_id = parseInt(model_id)
            const decodedToken = decode(req);
            const { username } = decodedToken;

            let query = `select * from models d where d.id='${model_id}'`;
            const result = await querySql(query);
            if (!result || result.length === 0) {
                console.log('user ', username, '  has no model');
                return res.json({
                    code: CODE_SUCCESS,
                    msg: '暂无数据',
                    data: {
                        username: username,
                        model_id: model_id,
                    }
                });
            } else {
                res.json({
                    code: CODE_SUCCESS,
                    msg: '查询成功',
                    data: result
                });
            }
        }
    } catch (error) {
        console.error('Error occurred while downloading:', error);
        res.json({
            code: CODE_ERROR,
            msg: '查询失败，请联系管理员',
            data: null
        });
    }
}

async function queryModelList(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{ msg }] = err.errors;
            res.json({
                code: CODE_ERROR,
                msg: msg,
                data: null
            });
        } else {
            let query = `select * from models d`;
            // 分页查询文件列表
            let { pageSize, pageNo, status, own, type, is_deleted } = req.query;
            pageSize = pageSize ? pageSize : 10;
            pageNo = pageNo ? pageNo : 1;
            status = status ? status : null;
            own = own ? own : null;
            let { username, identity } = decode(req);
            // 普通用户或者HR用户只能查看自己的文件
            if (identity === 'u' || identity === 'h') {
                own = 1;
            }
            // 查询条件
            if (own||status||type||is_deleted) {
                query += ' where ';
                let added = false;
                if (own) {
                    if(added) query += ' and ';
                    query += `d.username='${username}'`;
                    added = true;
                }
                if (status) {
                    if(added) query += ' and ';
                    query += `d.status='${status}'`;
                    added = true;
                }
                if (type) {
                    if(added) query += ' and ';
                    query += `d.type='${type}'`;
                    added = true;
                }
                if (is_deleted) {
                    if(added) query += ' and ';
                    query += `d.is_deleted='${is_deleted}'`;
                    added = true;
                }
            }
            const data = await querySql(query);
            if (!data || data.length === 0) {
                return res.json({
                    code: CODE_SUCCESS,
                    msg: '暂无数据',
                    data: null
                });
            }
            let total = data.length;
            let n = (pageNo - 1) * pageSize;
            // status
            let result_1;
            // all
            let result_2;

            if (status) {
                let query_1;
                if (own) {
                    query_1 = `select d.id, d.filename, d.model_description, d.origin_name, d.username, d.type, d.upload_gmt, d.status, d.is_deleted, d.task_id from models d where d.status='${status}' and d.username='${username}'`;
                } else {
                    query_1 = `select d.id, d.filename, d.model_description, d.origin_name, d.username, d.type, d.upload_gmt, d.status, d.is_deleted, d.task_id from models d where d.status='${status}'`;
                }
                result_1 = await querySql(query_1);

                if (!result_1 || result_1.length === 0) {
                    return res.json({
                        code: CODE_SUCCESS,
                        msg: '暂无数据',
                        data: null
                    });
                }

                let query_2 = query_1 + ` order by d.upload_gmt desc limit ${n}, ${pageSize}`;
                result_2 = await querySql(query_2);
            } else {
                let query_3 = query + ` order by d.upload_gmt desc limit ${n}, ${pageSize}`;
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
                msg: '查询成功',
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
        console.error('Error occurred while query file list:', error);
        res.json({
            code: CODE_ERROR,
            msg: '查询数据失败',
            data: null
        });
    }
}


async function downloadModel(req, res, next){
    try{
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{ msg }] = err.errors;
            res.json({
                code: CODE_ERROR,
                msg: msg,
                data: null
            });
        } else {
            let { username } = decode(req);
            let { model_id, own } = req.body;
            if (!model_id) {
                res.json({
                    code: CODE_ERROR,
                    msg: '文件id不能为空',
                    data: {
                        username: username,
                        model_id: model_id,
                        own: own
                    }
                });
            }
            model_id = parseInt(model_id)
            own = own ? own : null;

            let query;
            if (own) {
                query = `select d.id, d.filename, d.origin_name, d.username, d.type, d.upload_gmt, d.status, d.is_deleted, d.task_id, d.path from models d where d.username='${username}' and d.id='${model_id}'`;
            } else {
                query = `select d.id, d.filename, d.origin_name, d.username, d.type, d.upload_gmt, d.status, d.is_deleted, d.task_id, d.path from models d where d.id='${model_id}'`;
            }
            const result = await querySql(query);
            if (!result || result.length === 0) {
                console.log('user ', username, ' download :has no model');
                return res.json({
                    code: CODE_SUCCESS,
                    msg: '暂无数据',
                    data: {
                        username: username,
                        model_id: model_id,
                        own: own
                    }
                });
            } else {
                const { filename, origin_name, path } = result[0];
                console.log('user:', username, 'downloading:', filename);
                res.download(path, origin_name, (err) => {
                    if (err) {
                        console.error('Error occurred:', err);
                        console.log("path:", path)
                        res.json({
                            code: CODE_ERROR,
                            msg: '下载文件失败',
                            data: null
                        });
                    } else {
                        console.log("download success");
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error occurred while downloading:', error);
        res.json({
            code: CODE_ERROR,
            msg: '下载文件失败',
            data: null
        });
    }
}


module.exports = {
    uploadModel,
    queryModelInfo,
    queryModelList,
    downloadModel
}