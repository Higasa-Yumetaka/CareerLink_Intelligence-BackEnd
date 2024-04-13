
const neo4j = require('neo4j-driver');
const config = require('../db/neo4jConfig');

// const driver = neo4j.driver(`bolt://${host}:${port}`, neo4j.auth.basic(user, password));
// const session = driver.session();

function connect() {
    const { host, port, user, password } = config;
    return neo4j.driver(`bolt://${host}:${port}`, neo4j.auth.basic(user, password));
}

const runQuery = async (query, params) => {
    const driver = connect();
    // 若未成功连接neo4j
    if (!driver) {
        // throw new Error('failed to connect to neo4j');
        console.error('failed to connect to neo4j')
    } else {
        console.log('successfully connected to neo4j');
    }
    if (!query) {
        // throw new Error('query is required');
        console.error('query is required');
    }
    const session = driver.session();
    try {
        const result = await session.run(query, params);
        // 将结果转换为对象数组
        return result.records.map(record => record.toObject());
    } catch (e) {
        //throw e;
        console.error(e);
    } finally {
        await session.close();
        await driver.close();
    }
}

module.exports = {
    runQuery
}
