const jwt = require('jsonwebtoken');
const pool = require('./db');
const { newProductSchema } = require('./validations/product.validation');

async function addNewProduct(req, res) {
    const valResult =  newProductSchema.validate(req.body);

    if (valResult.error) {
        return res.status(400).json({
            status: 'fail',
            message: 'Object or value is invalid'
        });
    }

    const { name, price, description, weight } = req.body;

    try {
        await pool.query(
            `INSERT INTO products (name, price, description, weight, is_deleted)
            VALUES ($1, $2, $3, $4, $5);`,
            [name, price, description, weight, false]
        );
        return res.status(200).json({
            status: 'success',
            message: 'Added new product successfully'
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
}

async function addProductToCart(req, res) {
    const productId = req.params.productId;
    let foundProduct;

    try {
        foundProduct = await pool.query(
            'SELECT * FROM products WHERE id = $1;',
            [productId]
        );

        if (!foundProduct.rows.length) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            });
        }
    } catch (err) {
        console.error(err);
    }

    const token = req.headers['authorization'].split(' ')[1];
    const userId = jwt.decode(token).userId;

    const cartStatus = {
        IN_USE: 0,
        PROCESSED: 1,
        CANCELLED: 2
    };

    try {
        let foundCart = await pool.query(
            'SELECT * FROM carts WHERE user_id = $1 AND status = $2',
            [userId, cartStatus.IN_USE]
        );

        if (!foundCart.rows.length) {
            foundCart = await pool.query(
                `INSERT INTO carts (user_id, status)
                VALUES ($1, $2) RETURNING *;`,
                [userId, cartStatus.IN_USE]
            );
        }

        let foundCartProduct = await pool.query(
            'SELECT * FROM cart_products WHERE cart_id = $1 AND product_id = $2;',
            [foundCart.rows[0].id, productId]
        );

        if (!foundCartProduct.rows.length) {
            foundCartProduct = await pool.query(
                `INSERT INTO cart_products (cart_id, product_id, quantity)
                VALUES ($1, $2, $3) RETURNING *;`,
                [foundCart.rows[0].id, productId, 1]
            );
        } else {
            await pool.query(
                'UPDATE cart_products SET quantity = $1 WHERE cart_id = $2 AND product_id = $3;',
                [foundCartProduct.rows[0].quantity + 1,
                    foundCartProduct.rows[0].cart_id,
                    foundCartProduct.rows[0].product_id]
            );
        }

        return res.status(200).json({
            status: 'success',
            message: 'Successfully add product to cart'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: 'error',
            message: 'Unexpected server error'
        });
    }
}

async function getAllProducts(req, res) {
    let products;
    try {
        products = await pool.query(
            'SELECT * FROM products;'
        );

        if (!products.rows.length) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            });
        }
    } catch (err) {
        console.error(err);
    }

    try {
        return res.status(200).json({
            status: 'success',
            message: 'Found all products',
            data: {
                products: products.rows
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
}

async function getProductById(req, res) {
    const productId = req.params.productId;
    let foundProduct;

    try {
        foundProduct = await pool.query(
            'SELECT * FROM products WHERE id = $1;',
            [productId]
        );

        if (!foundProduct.rows.length) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            });
        }
    } catch (err) {
        console.error(err);
    }

    try {
        return res.status(200).json({
            status: 'success',
            message: 'Product found',
            data: {
                product: foundProduct.rows[0]
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
}

async function getAllProductsInCart(req, res) {
    const token = req.headers['authorization'].split(' ')[1];
    const userId = jwt.decode(token).userId;
    let productsInCart;

    try {
        productsInCart = await pool.query(
            `SELECT products.name AS name, products.price AS price, cart_products.quantity AS quantity
            FROM carts
            JOIN cart_products ON carts.id = cart_products.cart_id
            JOIN products ON cart_products.product_id = products.id
            WHERE carts.user_id = $1;`,
            [userId]
        );
    } catch (err) {
        console.error(err);
    }

    try {
        return res.status(200).json({
            status: 'success',
            message: 'Cart found',
            data: {
                products: productsInCart.rows
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Unexpected server error'
        });
    }
}

module.exports = {
    addNewProduct,
    addProductToCart,
    getAllProducts,
    getProductById,
    getAllProductsInCart
};