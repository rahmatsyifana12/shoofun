const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addProductToCart, getUserCart } = require('./utils/carts');
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

const viewCheckout = (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const userId = jwt.decode(token).userId;
    const userCart = getUserCart(userId);
    const foundUser = findUser(userId);

    if (!userCart || userCart.length) {
        // redirect to cart
    }

    try {
        return res.status(200).json({
            status: 'success',
            displayName: foundUser.displayName,
            address: foundUser.address,
            products: userCart
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
};

const addUserHandler = (req, res) => {
    const valResult = newUserSchema.validate(req.body);

    if (valResult.error) {
        res.status(400).json({
            status: 'fail',
            message: 'Object or value is invalid'
        });
    }

    const {
        email, password, displayName, address, phoneNumber
    } = req.body;

    try {
        const allUsers = pool.query('SELECT * FROM users WHERE email = $1;', [email]);

        if (allUsers.row.length === 0) {
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
        pool.query(
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

const loginUserHandler = (req, res) => {
    const { email, password } = req.body;
    const msg = { status: 'success', message: 'Successfully login' };
    let foundUser;

    try {
        foundUser = pool.query(
            'SELECT * FROM users WHERE email=$1;', [email]
        );

        if (foundUser.row.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Account doesn\'t exist'
            });
        }
    } catch (err) {
        console.error(err);
    }

    try {
        if (!bcrypt.compareSync(password, foundUser.row[0].password)) {
            msg.status = 'fail';
            msg.message = 'Object or value is invalid';

            return res.status(400).json({
                status: 'fail',
                message: 'Object or value is invalid'
            });
        }
        const token = jwt.sign(
            {
                userId: foundUser.row[0].id,
                email: foundUser.row[0].email
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

const viewProducts = (req, res) => {
    let products;
    try {
        products = pool.query(
            'SELECT * FROM products;'
        );

        if (products.row.length === 0) {
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
                products: products.row
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
};

const viewProductById = (req, res) => {
    const productId = req.params.productId;
    let foundProduct;

    try {
        foundProduct = pool.query(
            'SELECT * FROM products WHERE id = $1;',
            [productId]
        );

        if (foundProduct.row.length === 0) {
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
                product: foundProduct.row[0]
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
};

const addNewProductHandler = (req, res) => {
    const valResult =  newProductSchema.validate(req.body);

    if (valResult.error) {
        return res.status(400).json({
            status: 'fail',
            message: 'Object or value is invalid'
        });
    }

    const { name, price, description, weight } = req.body;

    try {
        pool.query(
            `INSERT INTO products (name, price, description, weight, is_deleted)
            VALUES ($1, $2, $3, $4);`,
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

const addProductToCartHandler = (req, res) => {
    const productId = req.params.productId;
    let foundProduct;

    try {
        foundProduct = pool.query(
            'SELECT * FROM products WHERE id = $1;',
            [productId]
        );

        if (foundProduct.row.length === 0) {
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
        let foundCart = pool.query(
            'SELECT * FROM carts WHERE user_id = $1 AND status = $2',
            [userId, cartStatus.IN_USE]
        );

        if (foundCart.row === 0) {
            foundCart = pool.query(
                `INSERT INTO carts (user_id, status)
                VALUES ($1, $2) RETURNING *;`,
                [userId, cartStatus.IN_USE]
            );
        }

        let foundCartProduct = pool.query(
            'SELECT * FROM cart_products WHERE cart_id = $1 AND product_id = $2;',
            [foundCart.row[0].cart_id, productId]
        );

        if (foundCartProduct.row.length === 0) {
            foundCartProduct = pool.query(
                `INSERT INTO cart_products (cart_id, product_id, quantity)
                VALUES ($1, $2, $3);`,
                [foundCart.row[0].cart_id, productId, 1]
            );
        } else {
            pool.query(
                'UPDATE cart_products SET quantity = $1 WHERE cart_id = $2 AND product_id = $3;',
                [foundCartProduct.row[0].quantity + 1,
                    foundCartProduct.row[0].cart_id,
                    foundCartProduct.row[0].product_id]
            );
        }

        return res.status(200).json({
            status: 'success',
            message: 'Successfully add product to cart'
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Unexpected server error'
        });
    }
};

const viewCart = (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const userId = jwt.decode(token).userId;
    let userCart;

    try {
        
    } catch (err) {
        console.error(err);
    }

    return res.status(200).json({
        status: 'success',
        message: 'Cart found',
        products: userCart
    });
};

const purchaseHandler = (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const userId = jwt.decode(token).userId;
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
    viewCart,
    viewCheckout,
    purchaseHandler
};