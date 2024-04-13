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
    DATA_FILE_PATH,
} = require('../utils/config').file;
const {
    CATEGORY_TOTALS,
} = require('../utils/config').visual;
const { decode } = require('../utils/user-jwt');
const { querySql } = require("../utils/mysql-dbHelper");
const { storage } = require("../utils/storage");
const { fs } = require("fs");
const csv = require("csv-parser");

async function queryVisualData(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const [{ msg }] = errors.array();
            console.error(msg);
            res.json({ code: CODE_ERROR, msg });
        } else {
            // 业务部分
            // 返回可视化数据
            const { type } = req.body;
            if (type === "category_totals") {
                const rows = [];
                const file_path = `${FILE_STORAGE_PATH}${DATA_FILE_PATH}${CATEGORY_TOTALS}.csv`;
                //console.log(file_path);
                fs.createReadStream(file_path)
                    .pipe(csv())
                    .on('data', (row) => {
                        rows.push(row);
                        //console.log(row);
                    })
                    .on('end', () => {

                        res.json({ code: CODE_SUCCESS, data: rows });
                    })
                    .on('error', (err) => {
                        console.error(err);
                        res.json({ code: CODE_ERROR, msg: err });
                    });
            }
        }
    } catch (e) {
        console.error(e);
        res.json({ code: CODE_ERROR, msg: e });
    }
}


module.exports = {
    queryVisualData,
}
