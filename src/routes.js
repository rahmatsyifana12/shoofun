const { Router } = require('express');
const { addNewUser, loginUserHandler } = require('./controllers/user.controller');
const { addNewProduct, addProductToCart, getAllProducts, getProductById, getAllProductsInCart } = require('./controllers/product.controller');
const { auth } = require('./middlewares/auth.middleware');

const router = Router();

router.get('/', getAllProducts);
router.get('/products/:productId', getProductById);
router.get('/cart', auth, getAllProductsInCart);

router.post('/login', loginUserHandler);
router.post('/register', addNewUser);
router.post('/products/add', addNewProduct);
router.post('/products/:productId', auth, addProductToCart);
router.post('/refreshtoken/', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader.split(' ')[1];

    if (!refreshToken) {
        return res.status(401).json({
            status: 'fail',
            message: 'Unauthorized error'
        });
    }
});

module.exports = router;