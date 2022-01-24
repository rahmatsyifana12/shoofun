const { Router } = require('express');
const { addUserHandler, loginUserHandler, viewRegisterPage, viewLoginPage, viewProducts, viewProductById } = require('./handler');

const router = Router();

router.get('/login', viewLoginPage);
router.get('/register', viewRegisterPage);
router.get('/', viewProducts);
router.get('/:productId', viewProductById);

router.post('/login', loginUserHandler);
router.post('/register', addUserHandler);


module.exports = router;