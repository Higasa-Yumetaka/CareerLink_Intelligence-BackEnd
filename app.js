const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const routes = require('./routes'); //自定义路由
const app = express();
const multer = require('multer');

app.use(bodyParser.json()); // 解析json数据格式
app.use(bodyParser.urlencoded({extended: true})); // 解析form表单提交的数据application/x-www-form-urlencoded

app.use(cors()); // 注入cors模块解决跨域

app.use('/', routes);

app.listen(8088, () => { // 监听8088端口
    console.log('服务已启动 http://localhost:8088');
})
