const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Product = require('./models/product');
const { addUser, userAlreadyExist, findUser } = require('./utils/users');
const { loadProducts, findProductById, addProduct } = require('./utils/products');
const { getUserId, getProductId, incrementUserId, incrementProductId } = require('./utils/ids');
const { addProductToCart, getUserCart } = require('./utils/carts');

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
        username, displayName, email, phoneNumber, address, password
    } = req.body;
    const id = getUserId();
    const newUser = new User(
        id, username, displayName, email, phoneNumber, address, password
    );
    const msg = { status: 'success', message: 'Successfully registered a new account' };

    if (userAlreadyExist(username, email)) {
        msg.status = 'fail';
        msg.message = 'This account is already exist';
        return res.status(400).json(msg);
    }

    const saltRounds = 10;
    newUser.password = bcrypt.hashSync(password, saltRounds);

    try {
        addUser(newUser);
        incrementUserId();

        return res.status(200).json(msg);
    } catch (err) {
        msg.status = 'fail';
        msg.message = 'Unexpected server error';

        return res.status(500).json(msg);
    }
};

const loginUserHandler = (req, res) => {
    const { email, password } = req.body;
    const msg = { status: 'success', message: 'Successfully login' };
    const foundUser = findUser(email);

    if (!foundUser) {
        msg.status = 'fail';
        msg.message = 'Account doesn\'t exist';

        return res.status(400).json(msg);
    }

    try {
        if (!bcrypt.compareSync(password, foundUser.password)) {
            msg.status = 'fail';
            msg.message = 'Object or value is invalid';

            return res.status(400).json(msg);
        }
        const token = jwt.sign(
            {
                userId: foundUser.id,
                username: foundUser.username
            },
            process.env.ACCESS_TOKEN_SECRET
        );
        Object.assign(msg, { token });

        return res.status(200).json(msg);
    } catch (err) {
        console.log(err);
        msg.status = 'fail';
        msg.message = 'Unexpected server error';

        return res.status(500).json(msg);
    }
};

const viewProducts = (req, res) => {
    const products = loadProducts();
    const msg = { status: 'success', message: 'Found all products' };

    if (products.length === 0) {
        msg.status = 'fail';
        msg.message = 'Product not found';

        return res.status(404).json(msg);
    }

    try {
        Object.assign(msg, { products });

        return res.status(200).json(msg);
    } catch (err) {
        msg.status = 'fail';
        msg.message = 'Unexpected server error';

        return res.status(500).json(msg);
    }
};

const viewProductById = (req, res) => {
    const productId = req.params.productId;
    const foundProduct = findProductById(parseInt(productId));
    const msg = { status: 'success', message: 'Product found' };

    if (!foundProduct) {
        msg.status = 'fail';
        msg.message = 'Product not found';

        return res.status(404).json(msg);
    }

    try {
        Object.assign(msg, { foundProduct });

        return res.status(200).json(msg);
    } catch (err) {
        msg.status = 'fail';
        msg.message = 'Unexpected server error';

        return res.status(500).json(msg);
    }
};

const addNewProductHandler = (req, res) => {
    const { name, price, description } = req.body;
    const id = getProductId();
    const newProduct = new Product(id, name, price, description, 0);
    const msg = { status: 'success', message: 'Added new product successfully' };

    try {
        addProduct(newProduct);
        incrementProductId();

        return res.status(200).json(msg);
    } catch (err) {
        msg.status = 'fail';
        msg.message = 'Unexpected server error';

        return res.status(500).json(msg);
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