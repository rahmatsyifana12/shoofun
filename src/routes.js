const { Router } = require('express');
const { addUserHandler, loginUserHandler } = require('./handler');

const router = Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', loginUserHandler);

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', addUserHandler);


module.exports = router;