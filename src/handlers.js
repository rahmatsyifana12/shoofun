const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Product = require('./models/product');
const { addUser, userAlreadyExist, findUser } = require('./utils/users');
const { loadProducts, findProductById, addProduct } = require('./utils/products');
const { getUserId, getProductId, incrementUserId, incrementProductId } = require('./utils/ids');
const { addProductToCart, getUserCart } = require('./utils/carts');
const pool = require('./db');

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
    const {
        email, password, displayName, address, phoneNumber
    } = req.body;

    try {
        const allUsers = pool.query('SELECT * FROM users WHERE email=$1;', [email]);

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
            token
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
            products: products.row
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
            'SELECT * FROM products WHERE id=$1;',
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
            product: foundProduct.row[0]
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
};

const addNewProductHandler = (req, res) => {
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
    const foundProduct = findProductById(parseInt(productId));
    const token = req.headers['authorization'].split(' ')[1];
    const userId = jwt.decode(token).userId;

    if (!foundProduct) {
        return res.status(404).json({
            status: 'fail',
            message: 'Product not found'
        });
    }

    try {
        addProductToCart(userId, foundProduct);
        return res.status(200).json({
            status: 'success',
            message: 'Successfully added product to cart'
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
    const userCart = getUserCart(userId);

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