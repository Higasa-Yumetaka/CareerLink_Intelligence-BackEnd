

const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { PRIVATE_KEY } = require('./config'); // 从constant.js引入jwt密钥

// 验证token是否过期
// const jwtAuth = expressJwt({
//     secret: PRIVATE_KEY,
//     credentialsRequired: true
// }).unless({
//     path: [
//         '/',
//         '/user/login',
//         '/user/register']
// });

const whiteList = [
    '/',
    '/api/login',
    '/api/register',
    '/api/resetPwd',
    '/api/queryArea',
    '/api/querySubordinateArea',
    '/api/queryVisualData',
    '/api/getUserInfoByParams',
]

function verifyToken(req, res, next) {
    // 从请求头中获取 token
    let token = req.headers['authorization'];
    if (!token) {
        token = req.headers['token']
        //console.log('token from headers:', token)
    }
    if (!token) {
        // 从cookie中获取token
        const cookies = req.headers.cookie;
        if (cookies) {
            const cookieArr = cookies.split(';');
            for (let i = 0; i < cookieArr.length; i++) {
                const cookie = cookieArr[i].trim();
                if (cookie.startsWith('Authorization')) {
                    token = cookie.split('=')[1];
                    //console.log('token from cookie:', token)
                    break;
                }
            }
        }
    }

    const beforeQuestionMark = req.url.match(/[^?]+/)[0];

    //console.log('beforeQuestionMark', beforeQuestionMark)
    if (whiteList.includes(beforeQuestionMark)) {
        // 如果在白名单中，跳过 token 验证
        return next();
    }

    // 检查 token 是否存在
    if (!token) {
        return res.status(401).json({
            code: 401,
            msg: 'No token provided'
        });
    }

    // 验证 token
    jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                code: 401,
                msg: 'Invalid token'
            });
        }
        // 将解码后的信息存储在请求对象中以供后续路由使用
        req.user = decoded;
        next(); // 继续执行下一个中间件或路由处理程序
    });
}



// jwt-token解析
function decode(req) {
    const token = req.get('Authorization')
    return jwt.verify(token, PRIVATE_KEY);
}

module.exports = {
    verifyToken,
    decode
}
