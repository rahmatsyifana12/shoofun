const fs = require('fs');

const loadCarts = () => {
    const fileBuffer = fs.readFileSync('data/carts.json', 'utf-8');
    const carts = JSON.parse(fileBuffer);

    return carts;
}

const saveCarts = (carts) => {
    fs.writeFileSync('data/carts.json', JSON.stringify(carts, null, 4));
}

const findCartByUserId = (userId) => {
    const carts = loadCarts();
    
    return carts.find((cart) => cart.userId === userId);
}

const createUserCart = (userId, product) => {
    const carts = loadCarts();
    carts.push({ userId, products: [product] });
}


const addProductToCart = (userId, product) => {
    const foundCart = findCartByUserId(userId);

    if (!foundCart) {
        createUserCart(userId, product);
    } else {
        foundCart.products.push(product);
    }
}

module.exports = { findCartByUserId, addProductToCart };