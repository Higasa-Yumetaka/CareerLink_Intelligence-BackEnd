//数据库

const mysql = require('mysql');
const config = require('../db/dbConfig');

function connect() {
    const { host, user, password, database } = config;
    //console.log('host===',host)
    return mysql.createConnection({
        host,
        user,
        password,
        database
    })
}

//查询连接
function querySql(sql) {
    const conn = connect();
    return new Promise((resolve, reject) => {
        try {
            conn.query(sql, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
        } catch (e) {
            reject(e);
        } finally {
            conn.end();
        }
    })
}

//查询语句
function queryOne(sql) {
    return new Promise((resolve, reject) => {
        querySql(sql).then(res => {
            //console.log('res===',res)
            if (res && res.length > 0) {
                resolve(res[0]);
            } else {
                resolve(null);
            }
        }).catch(err => {
            reject(err);
        })
    })
}

module.exports = {
    querySql,
    queryOne
}
