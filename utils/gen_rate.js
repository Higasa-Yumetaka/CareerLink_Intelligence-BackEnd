// 生成随机介于0.8到0.99之间的随机值
function generateRandomValue() {
    return (Math.random() * (0.99 - 0.8) + 0.8).toFixed(2);
}

// 生成一段JSON数据
function generateRate(count) {
    const jsonArray = [];
    for (let i = 1; i <= count; i++) {
        const obj = {};
        obj[i.toString()] = generateRandomValue();
        jsonArray.push(obj);
    }
    //console.log(jsonArray);
    return JSON.stringify(jsonArray)
}


module.exports = generateRate;