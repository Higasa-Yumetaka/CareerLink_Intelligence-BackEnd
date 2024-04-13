const multer = require("multer");
const {FILE_STORAGE_PATH} = require("./config").file;
const {decode} = require("./user-jwt");

function storage(destinationPath) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            //拼接文件存储路径
            const FINAL_PATH = FILE_STORAGE_PATH + destinationPath;
            //console.log('FINAL_PATH:', FINAL_PATH);
            // 设置文件存储路径
            cb(null, FINAL_PATH); // 使用传入的路径参数
        },
        // 设置文件名称
        filename: function (req, file, cb) {
            // 获取文件名
            const filenameArr = file.originalname.split('.');
            //console.log('filenameArr:', filenameArr);
            //console.log(filenameArr[0]);
            // 设置文件名：SHA256(时间戳+用户名).文件后缀
            const decodedToken = decode(req);
            const {username} = decodedToken;
            cb(null, `${Date.now() + "_" + username}.${filenameArr[filenameArr.length - 1]}`);
            //cb(null, `${Date.now()}.${filenameArr[filenameArr.length - 1]}`);
        }
    });
}

// 调用 storage 函数并传递路径参数
const upload = multer({ storage: storage('/your/destination/path') });


module.exports = {
    storage
}