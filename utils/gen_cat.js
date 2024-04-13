// 生成随机介于0.8到0.99之间的随机值
function generateRandomValue() {
    return (Math.random() * (0.99 - 0.8) + 0.8).toFixed(2);
}

// 生成指定数量的子对象
function generateSubObjects(count) {
    const subObjects = [];
    for (let i = 1; i <= count; i++) {
        subObjects.push({ [i.toString()]: generateRandomValue() });
    }
    return subObjects;
}

// 生成一段JSON数据
function generateRate() {
    const randomCount = Math.floor(Math.random() * 15) + 1; // 生成随机数量，1到8之间
    const jsonArray = [];
    for (let i = 1; i <= randomCount; i++) {
        jsonArray.push(generateSubObjects(i));
    }
    return jsonArray;
}

module.exports = generateRate;