const { Router } = require('express');
const { addUserHandler, loginUserHandler, viewRegisterPage, viewLoginPage, viewProducts, viewProductById, addProductHandler, viewAddProductPage } = require('./handler');

const router = Router();

router.get('/login', viewLoginPage);
router.get('/register', viewRegisterPage);
router.get('/', viewProducts);
router.get('/:productId', viewProductById);
router.get('/products/add', viewAddProductPage);

router.post('/login', loginUserHandler);
router.post('/register', addUserHandler);
router.post('/products/add', addProductHandler);

module.exports = router;