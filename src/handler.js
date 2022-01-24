const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addUser, userAlreadyExist, findUser } = require('./utils/users');
const User = require('./models/user');

const addUserHandler = (req, res) => {
    const { username, displayName, email, phoneNumber, password } = req.body;
    const id = nanoid(8);

    const newUser = new User(id, username, displayName, email, phoneNumber, password);

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
        console.log(newUser);

        return res.status(200).json(msg);
    } catch (err) {
        msg.status = 'fail';
        msg.message = 'Unexpected server error';

        return res.status(500).json(msg);
    }
};

const loginUserHandler = (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const msg = { status: 'success', message: 'Successfully login' };
    const foundUser = findUser(usernameOrEmail);

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

        const token = jwt.sign({ username: foundUser.username }, process.env.ACCESS_TOKEN_SECRET);
        Object.assign(msg, { token });

        return res.status(200).json(msg);
    } catch (err) {
        console.log(err);
        msg.status = 'fail';
        msg.message = 'Unexpected server error';

        return res.status(500).json(msg);
    }
};  

module.exports = { addUserHandler, loginUserHandler };