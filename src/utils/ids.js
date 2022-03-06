const fs = require('fs');

const loadIds = () => {
    const fileBuffer = fs.readFileSync('data/ids.json', 'utf-8');
    const ids = JSON.parse(fileBuffer);

    return ids;
};

const saveIds = (ids) => {
    fs.writeFileSync('data/ids.json', JSON.stringify(ids, null, 4));
};

const getUserId = () => {
    const ids = loadIds();

    return ids.userId;
};

const getProductId = () => {
    const ids = loadIds();

    return ids.productIdewId;
};

const incrementUserId = () => {
    const ids = loadIds();
    ids.userId++;
    saveIds(ids);
};

const incrementProductId = () => {
    const ids = loadIds();
    ids.productId++;
    saveIds(ids);
};

module.exports = {
    getUserId,
    getProductId,
    incrementUserId,
    incrementProductId
};