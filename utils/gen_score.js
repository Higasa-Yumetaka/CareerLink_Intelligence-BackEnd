// 生成随机介于0.8到0.99之间的随机值
function generateRandomValue() {
    return (Math.random() * (9.99 - 7.2) + 7.2).toFixed(3);
}

// 生成一段JSON数据
function generateScore(count) {
    const jsonArray = [];
    for (let i = 1; i <= count; i++) {
        const obj = {};
        obj[i.toString()] = generateRandomValue();
        jsonArray.push(obj);
    }
    //console.log(jsonArray);
    return JSON.stringify(jsonArray)
}

module.exports = generateScore;