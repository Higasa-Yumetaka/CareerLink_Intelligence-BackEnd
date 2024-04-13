//TODO:删除文件；查询文件列表；查询文件详情；更新文件信息；

const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const { validationResult } = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS,

} = require('../utils/config');
const {
    FILE_STORAGE_PATH,
    FILE_UPLOAD_PATH,
} = require('../utils/config').file;
const { decode } = require('../utils/user-jwt');
const { querySql } = require("../utils/mysql-dbHelper");
const { storage } = require("../utils/storage");

function uploadFile(req, res, next) {
    try {
        const upload = multer({storage: storage(FILE_UPLOAD_PATH)}).single('file');
        upload( req, res, function (err) {
            if (err) {
                console.error("Error occurred while upload file", err);
                res.json({
                    code: CODE_ERROR,
                    msg: '文件上传失败',
                    data: null
                });
            } else {
                const decodedToken = decode(req);
                const {username} = decodedToken;
                const query = `insert into files (filename, origin_name, username) values ('${req.file.filename}', '${req.file.originalname}', '${username}')`;
                const filePath = FILE_STORAGE_PATH + FILE_UPLOAD_PATH +'/' + req.file.filename;

                try {
                    const { task_id, type, status } = req.body;
                    const query = `insert into files (filename, origin_name, username, path, task_id, type, status ) values ('${req.file.filename}', '${req.file.originalname}', '${username}', '${filePath}', '${task_id}', '${type}', '${status}')`;
                    querySql(query)
                        .then(data => {
                            if (data && data.insertId) {
                                res.json({
                                    code: CODE_SUCCESS,
                                    msg: '文件上传成功',
                                    data: {
                                        //url: `http://localhost:8088/${req.file.filename}`
                                    }
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
            msg: '文件上传失败',
            data: null
        });
    }
}

async function queryFileList(req, res, next) {
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
            let query = `select * from files d`;
            // 分页查询文件列表
            let { pageSize, pageNo, status, own, type, is_deleted } = req.body;
            pageSize = pageSize ? pageSize : 10;
            pageNo = pageNo ? pageNo : 1;
            status = (status && status === '0') ? status : null;
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
                    query_1 = `select d.id, d.filename, d.origin_name, d.username, d.type, d.upload_gmt, d.status, d.is_deleted, d.task_id from files d where d.status='${status}' and d.username='${username}'`;
                } else {
                    query_1 = `select d.id, d.filename, d.origin_name, d.username, d.type, d.upload_gmt, d.status, d.is_deleted, d.task_id from files d where d.status='${status}'`;
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

async function downloadFile(req, res, next){
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
            let { fileId, own } = req.body;
            if (!fileId) {
                res.json({
                    code: CODE_ERROR,
                    msg: '文件id不能为空',
                    data: {
                        username: username,
                        fileId: fileId,
                        own: own
                    }
                });
            }
            fileId = parseInt(fileId)
            own = own ? own : null;

            let query;
            if (own) {
                query = `select d.id, d.filename, d.origin_name, d.username, d.type, d.upload_gmt, d.status, d.is_deleted, d.task_id, d.path from files d where d.username='${username}' and d.id='${fileId}'`;
            } else {
                query = `select d.id, d.filename, d.origin_name, d.username, d.type, d.upload_gmt, d.status, d.is_deleted, d.task_id, d.path from files d where d.id='${fileId}'`;
            }
            const result = await querySql(query);
            if (!result || result.length === 0) {
                //console.log('user ', username, ' download :has no files');
                return res.json({
                    code: CODE_SUCCESS,
                    msg: '暂无数据',
                    data: {
                        username: username,
                        fileId: fileId,
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


// 文件上传
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, FILE_UPLOAD_PATH);
//     },
//     filename: function (req, file, cb) {
//         const filenameArr = file.originalname.split('.');
//         console.log('filenameArr:', filenameArr);
//         console.log(filenameArr[0]);
//         cb(null, `${Date.now()}.${filenameArr[filenameArr.length - 1]}`);
//     }
// })

module.exports = {
    uploadFile,
    queryFileList,
    downloadFile
}
