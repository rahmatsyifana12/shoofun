const { addUser, userAlreadyExist } = require('./utils/users');

const addUserHandler = (req, res) => {
    const { username, displayName, email, phoneNumber, password } = req.body;
    const msg = { status: 'success', message: 'Successfully registered a new account' };

    if (userAlreadyExist(username, email)) {
        msg.status = 'fail';
        msg.message = 'This account is already exist';
        return res.status(400).json(msg);
    }

    try {
        addUser(req.body);
        return res.status(200).json(msg);
    } catch (err) {
        msg.status = 'fail';
        msg.message = 'Unexpected server error';
        return res.status(500).json(msg);
    }
    
};

const loginUserHandler = (req, res) => {
    const { email, password } = req.body;
    
};

module.exports = { addUserHandler, loginUserHandler };