const fs = require('fs');

const dataPath = 'data/products.json';
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
}

const loadProducts = () => {
    const fileBuffer = fs.readFileSync('data/products.json', 'utf-8');
    const products = JSON.parse(fileBuffer);

    return products;
}

const findProductById = (id) => {
    const products = loadProducts();

    return products.find((product) => product.id === id);
}

module.exports = { loadProducts, findProductById };