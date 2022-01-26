const { Router } = require('express');
const { addUserHandler, loginUserHandler, viewRegisterPage, viewLoginPage, viewProducts, viewProductById, addNewProductHandler, viewAddProductPage, addProductToCartHandler } = require('./handlers');

const router = Router();

router.get('/login', viewLoginPage);
router.get('/register', viewRegisterPage);
router.get('/', viewProducts);
router.get('/products/:productId', viewProductById);
router.get('/products/add', viewAddProductPage);

router.post('/login', loginUserHandler);
router.post('/register', addUserHandler);
router.post('/products/add', addNewProductHandler);
router.post('/products/:productId', addProductToCartHandler); 

module.exports = router;