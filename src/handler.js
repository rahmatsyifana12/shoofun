const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const { redirect } = require('express/lib/response');
const { addUser, userAlreadyExist, findUser, confirmedPassword } = require('./utils/users');
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

    try {
        const saltRounds = 10;
        newUser.password = bcrypt.hashSync(password, saltRounds);
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
    const user = findUser(usernameOrEmail);

    if (!user) {
        msg.status = 'fail';
        msg.message = 'Account doesn\'t exist';
        return res.status(400).json(msg);
    }

    if (!bcrypt.compareSync(password, user.password)) {
        msg.status = 'fail';
        msg.message = 'Object or value is invalid';
        return res.status(400).json(msg);
    }

    try {
        return res.status(200).json(msg);
    } catch (err) {
        msg.status = 'fail';
        msg.message = 'Unexpected server error';
        return res.status(500).json(msg);
    }
};  

module.exports = { addUserHandler, loginUserHandler };