const { Router } = require('express');
const { addUserHandler, loginUserHandler } = require('./handler');

const router = Router();

router.get('/login', (req, res) => {
    res.send('<h1>LOGIN PAGE</h1>');
});

router.post('/login', loginUserHandler);

router.get('/register', (req, res) => {
    res.send('<h1>REGISTER PAGE</h1>');
});

router.post('/register', addUserHandler);


module.exports = router;