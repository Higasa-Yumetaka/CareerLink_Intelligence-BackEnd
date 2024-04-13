const { querySql, queryOne } = require('../utils/mysql-dbHelper');
const md5 = require('../utils/md5');
const jwt = require('jsonwebtoken');
const boom = require('boom'); // 引入boom模块，处理程序异常状态
const { body, validationResult } = require('express-validator');
const {
    CODE_ERROR,
    CODE_SUCCESS,
    PRIVATE_KEY,
    JWT_EXPIRED
} = require('../utils/config');
const { decode } = require('../utils/user-jwt');


// 用户登录
function login(req, res, next) {
    //console.log('PRIVATE_KEY===', PRIVATE_KEY)
    try {
        const err = validationResult(req);
        // 如果验证错误，empty不为空
        if (!err.isEmpty()) {
            // 获取错误信息
            const [{ msg }] = err.errors;
            // 抛出错误
            console.error('Error occurred during login:', msg)
            res.json({
                code: CODE_ERROR,
                msg: msg,
                data: null
            });
        } else {
            let { username, password } = req.body;
            // md5加密
            password = md5(password);
            const query = `select * from users where username='${username}' and password='${password}'`;
            querySql(query)
                .then(user => {
                    // console.log('用户登录===', user);
                    if (!user || user.length === 0) {
                        res.json({
                            code: CODE_ERROR,
                            msg: '用户名或密码错误',
                            data: null
                        });
                    } else {
                        // 获取用户信息

                        // 登录成功，签发一个token并返回给前端
                        const token = jwt.sign(
                            // payload：签发的 token 里面要包含的一些数据。
                            { username ,identity: user[0].identity},
                            // 私钥
                            PRIVATE_KEY,
                            // 设置过期时间
                            { expiresIn: JWT_EXPIRED }
                        );

                        let userData = {
                            id: user[0].id,
                            username: user[0].username,
                            nickname: user[0].nickname,
                            avator: user[0].avator,
                            sex: user[0].sex,
                            gmt_create: user[0].gmt_create,
                            gmt_modify: user[0].gmt_modify,
                            identity: user[0].identity
                        };

                        res.json({
                            code: CODE_SUCCESS,
                            msg: '登录成功',
                            data: {
                                token,
                                userData
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error occurred during login:', error);
                    res.json({
                        code: CODE_ERROR,
                        msg: '登录失败，请稍后重试',
                        data: null
                    });
                });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '登录失败，请稍后重试',
            data: null
        });
    }
}


// 注册
async function register(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{ msg }] = err.errors;
            console.error('Error occurred during register:', msg)
            res.json({
                code: CODE_ERROR,
                msg: msg,
                data: null
            });
        } else {
            let { username, password, nickname, avator, sex, identity} = req.body;
            if (!username || !password) {
                return res.json({
                    code: CODE_ERROR,
                    msg: '用户名或密码不能为空',
                    data: null
                });
            }
            identity = identity ? identity : 'u';
            if (identity === 's' && identity === 'a') {
                return res.json({
                    code: CODE_ERROR,
                    msg: '用户身份错误！',
                    data: null
                });
            }
            const user = await findUser(username);
            if (user) {
                return res.json({
                    code: CODE_ERROR,
                    msg: '用户名已存在',
                    data: null
                });
            } else {
                password = md5(password);
                const query = `insert into users(username, password, nickname, avator, sex, identity) values('${username}', '${password}', '${nickname}', '${avator}', '${sex}', '${identity}')`;
                const result = await querySql(query);
                if (!result || result.length === 0) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '注册失败，请联系管理员',
                        data: null
                    });
                } else {
                    const queryUser = `select * from users where username='${username}' and password='${password}'`;
                    const user = await querySql(queryUser);
                    if (!user || user.length === 0) {
                        return res.json({
                            code: CODE_ERROR,
                            msg: '注册失败，请联系管理员',
                            data: null
                        });
                    } else {
                        const token = jwt.sign(
                            { username },
                            PRIVATE_KEY,
                            { expiresIn: JWT_EXPIRED }
                        );

                        let userData = {
                            id: user[0].id,
                            username: user[0].username,
                            nickname: user[0].nickname,
                            avator: user[0].avator,
                            sex: user[0].sex,
                            gmt_create: user[0].gmt_create,
                            gmt_modify: user[0].gmt_modify
                        };

                        return res.json({
                            code: CODE_SUCCESS,
                            msg: '注册成功',
                            data: {
                                token,
                                userData
                            }
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '注册失败，请稍后重试',
            data: null
        });
    }
}


// 获取用户信息(根据token/headers)
async function getUserInfo(req, res, next) {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{ msg }] = err.errors;
        console.error('Error occurred during getUserInfo:', msg)
        res.json({
            code: CODE_ERROR,
            msg: msg,
            data: null
        });
    } else {
        const decodedToken = decode(req);
        const { username } = decodedToken;
        const user = await findUser(username);
        if (!user) {
            res.json({
                code: CODE_ERROR,
                msg: '用户信息不存在',
                data: null
            });
        } else {
            res.json({
                code: CODE_SUCCESS,
                msg: '获取用户信息成功',
                data: user
            });
        }
    }
}


// 获取用户信息(根据用户名/params)
async function getUserInfoByParams(req, res, next) {
const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{ msg }] = err.errors;
        console.error('Error occurred during getUserInfoByParams:', msg)
        res.json({
            code: CODE_ERROR,
            msg: msg,
            data: null
        });
    } else {
        const { username } = req.query;
        console.debug('username===', username)
        const user = await findUser(username);
        if (!user) {
            res.json({
                code: CODE_ERROR,
                msg: '用户信息不存在',
                data: null
            });
        } else {
            res.json({
                code: CODE_SUCCESS,
                msg: '获取用户信息成功',
                data: user
            });
        }
    }
}

async function updateUserInfo(req, res, next) {
const err = validationResult(req);
    if (!err.isEmpty()) {
        const [{ msg }] = err.errors;
        console.error('Error occurred during editUserInfo:', msg)
        res.json({
            code: CODE_ERROR,
            msg: msg,
            data: null
        });
    } else {
        const decodedToken = decode(req);
        const {username} = decodedToken;
        const {nickname, location} = req.body;
        const baseSql = `update users set `;
        let updateSql = '';
        let exist = false;
        if (nickname) {
            exist = true;
            updateSql += `nickname='${nickname}',`;
        }
        if (location) {
            exist = true;
            updateSql += `location='${location}',`;
        }
        if (!exist) {
            return;
        }
        updateSql = updateSql.substring(0, updateSql.length - 1);
        updateSql += ` WHERE username='${username}'`;
        const addSql = baseSql + updateSql;
        const user = await querySql(addSql);
        if (!user || user.length === 0) {
            return res.json({
                code: CODE_ERROR,
                msg: '修改用户信息失败',
                data: null
            });
        } else {
            return res.json({
                code: CODE_SUCCESS,
                msg: '修改用户信息成功',
                data: null
            });
        }
    }
}


// 重置密码
async function resetPwd(req, res, next) {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            const [{ msg }] = err.errors;
            console.error('Error occurred during resetPwd:', msg)
            res.json({
                code: CODE_ERROR,
                msg: msg,
                data: null
            });
        } else {
            let { username, oldPassword, newPassword } = req.body;
            oldPassword = md5(oldPassword);
            const data = await validateUser(username, oldPassword);
            console.log('校验用户名和密码===', data);
            if (data) {
                if (!newPassword) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '新密码不能为空',
                        data: null
                    });
                }
                newPassword = md5(newPassword);
                const query = `update users set password='${newPassword}' where username='${username}'`;
                const user = await querySql(query);
                if (!user || user.length === 0) {
                    return res.json({
                        code: CODE_ERROR,
                        msg: '重置密码失败',
                        data: null
                    });
                } else {
                    return res.json({
                        code: CODE_SUCCESS,
                        msg: '重置密码成功',
                        data: null
                    });
                }
            } else {
                return res.json({
                    code: CODE_ERROR,
                    msg: '用户名或旧密码错误',
                    data: null
                });
            }
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.json({
            code: CODE_ERROR,
            msg: '重置密码失败，请稍后重试',
            data: null
        });
    }
}


// 校验用户名和密码
function validateUser(username, oldPassword) {
    const query = `select id, username from users where username='${username}' and password='${oldPassword}'`;
    return queryOne(query);
}

// 通过用户名查询用户信息
function findUser(username) {
    const query = `select d.id, d.username, d.nickname, d.avator, d.sex, d.location, d.gmt_create, d.gmt_modify from users d where username='${username}'`;
    return queryOne(query);
}

module.exports = {
    login,
    register,
    resetPwd,
    getUserInfo,
    getUserInfoByParams,
    updateUserInfo
}
