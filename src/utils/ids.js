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

    const newId = ids.userId;
    ids.userId++;
    saveIds(ids);

    return newId;
};

const getProductId = () => {
    const ids = loadIds();

    const newId = ids.productId;
    ids.productId++;
    saveIds(ids);
    return newId;
};

module.exports = { getUserId, getProductId };