
// Description: 常量配置

// JWT配置
module.exports = {
    CODE_ERROR: -1, // 请求响应失败code
    CODE_SUCCESS: 0, // 请求响应成功code
    CODE_TOKEN_EXPIRED: 401, // 授权失败code
    PRIVATE_KEY: 'defaults', // jwt加密私钥
    JWT_EXPIRED: 60 * 60 * 24 * 10, // token过期时间(秒)
}

// 文件存储配置
module.exports.file = {
    FILE_STORAGE_PATH: 'E:/AIMT', // 文件存储路径
    FILE_UPLOAD_PATH: '/upload', // 文件上传路径
    FILE_DOWNLOAD_PATH: '/download', // 文件下载路径
    FILE_PREVIEW_PATH: '/preview', // 文件预览路径
    FILE_AVATOR_PATH: '/avator', // 用户头像路径
    MODEL_PATH: '/model', // 模型路径
    DATASET_PATH: '/dataset', // 数据集路径
    DATA_FILE_PATH: '/visual_files', // 可视化数据文件路径

}


module.exports.models = {
    // 模型文件存储路径
    MODEL_PATH: 'E:/AIMT/upload/model',
    MODEL_UPLOAD_PATH: '/upload/model',
    // 模型文件下载路径
    MODEL_DOWNLOAD_PATH: '/download',
}

module.exports.datasets = {
    // 模型文件存储路径
    DATASET_PATH: 'E:/AIMT/upload/model',
    DATASET_UPLOAD_PATH: '/upload/model',
    // 模型文件下载路径
    DATASET_DOWNLOAD_PATH: '/download',
}


// 可视化数据接口
module.exports.visual = {
    CATEGORY_TOTALS: '/category1_totals', // 分类总数
    AVERAGE: '/average', // 平均值
}

// 推荐接口
module.exports.recommand = {
    PROTOCOL: 'http', // 请求协议
    HOST: 'localhost', // 请求主机
    // 职业推荐
    CATEGORY_PORT: 8089, // 请求端口
    CATEGORY_PATH: '/match_jobs', // 请求路径
    // 岗位推荐
    PROFESSION_PORT: 8090, // 请求端口
    PROFESSION_PATH: '/query', // 请求路径
}


// NEO4J图形数据接口
module.exports.neo4j = {
    PROTOCOL: 'http',
    HOST: 'localhost',
    PORT: 8070,
    NEO4J_URL: '/search_entity_relations',
}


// 代理配置
module.exports.proxy = {
    PROXY_URL: 'http://localhost:8000',
}
