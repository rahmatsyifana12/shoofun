const { Router } = require('express');
const {
    addUserHandler,
    loginUserHandler,
    viewRegisterPage,
    viewLoginPage,
    viewProducts,
    viewProductById,
    addNewProductHandler,
    viewAddProductPage,
    addProductToCartHandler,
    viewCart
} = require('./handlers');
const { auth } = require('./middlewares/auth.middleware');

const router = Router();

router.get('/login', viewLoginPage);
router.get('/register', viewRegisterPage);
router.get('/', viewProducts);
router.get('/products/:productId', viewProductById);
router.get('/products/add', viewAddProductPage);
router.get('/cart', auth, viewCart);

router.post('/login', loginUserHandler);
router.post('/register', addUserHandler);
router.post('/products/add', addNewProductHandler);
router.post('/products/:productId', auth, addProductToCartHandler);

module.exports = router;