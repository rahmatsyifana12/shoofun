const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { newUserSchema } = require('./validations/user.validation');
const { newProductSchema } = require('./validations/product.validation');

const viewRegisterPage = (req, res) => {
    res.render('register');
};

const viewLoginPage = (req, res) => {
    res.render('login');
};

const viewAddProductPage = (req, res) => {
    res.render('addProduct');
};

// const viewCheckout = (req, res) => {
//     const token = req.headers['authorization'].split(' ')[1];
//     const userId = jwt.decode(token).userId;
//     const userCart = getUserCart(userId);
//     const foundUser = findUser(userId);

//     if (!userCart || userCart.length) {
//         // redirect to cart
//     }

//     try {
//         return res.status(200).json({
//             status: 'success',
//             displayName: foundUser.displayName,
//             address: foundUser.address,
//             products: userCart
//         });
//     } catch (err) {
//         return res.status(500).json({
//             status: 'fail',
//             message: 'Unexpected server error'
//         });
//     }
// };

const addUserHandler = async (req, res) => {
    const valResult = newUserSchema.validate(req.body);

    if (valResult.error) {
        console.error(valResult);
        return res.status(400).json({
            status: 'fail',
            message: 'Object or value is invalid'
        });
    }

    const {
        email, password, displayName, address, phoneNumber
    } = req.body;

    try {
        const allUsers = await pool.query('SELECT * FROM users WHERE email = $1;', [email]);
        if (allUsers.rows.length) {
            return res.status(400).json({
                status: 'fail',
                message: 'This account is already exist'
            });
        }
    } catch (err) {
        console.error(err);
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    try {
        await pool.query(
            `INSERT INTO users (email, password, display_name, address, phone_number)
            VALUES ($1, $2, $3, $4, $5);`,
            [email, hashedPassword, displayName, address, phoneNumber]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Successfully registered a new account'
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
};

const loginUserHandler = async (req, res) => {
    const { email, password } = req.body;
    const msg = { status: 'success', message: 'Successfully login' };
    let foundUser;

    try {
        foundUser = await pool.query(
            'SELECT * FROM users WHERE email=$1;', [email]
        );

        if (!foundUser.rows.length) {
            return res.status(400).json({
                status: 'fail',
                message: 'Account doesn\'t exist'
            });
        }
    } catch (err) {
        console.error(err);
    }

    try {
        if (!bcrypt.compareSync(password, foundUser.rows[0].password)) {
            msg.status = 'fail';
            msg.message = 'Object or value is invalid';

            return res.status(400).json({
                status: 'fail',
                message: 'Object or value is invalid'
            });
        }
        const token = jwt.sign(
            {
                userId: foundUser.rows[0].id,
                email: foundUser.rows[0].email
            },
            process.env.ACCESS_TOKEN_SECRET
        );

        return res.status(200).json({
            status: 'success',
            message: 'Successfully login',
            data: {
                token
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
};

const addNewProductHandler = async (req, res) => {
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
};

const viewProducts = async (req, res) => {
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
};

const viewProductById = async (req, res) => {
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
};

const addProductToCartHandler = async (req, res) => {
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
};

const getAllProductsInCart = async (req, res) => {
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
};

module.exports = {
    addUserHandler,
    loginUserHandler,
    viewRegisterPage,
    viewLoginPage,
    viewProducts,
    viewProductById,
    addNewProductHandler,
    viewAddProductPage,
    addProductToCartHandler,
    getAllProductsInCart
};