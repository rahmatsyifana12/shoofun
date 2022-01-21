const addUserHandler = (req, res) => {
    const { username, displayName, email, phoneNumber, password } = req.body;
};

const loginUserHandler = (req, res) => {
    const { email, password } = req.body;
};

module.exports = { addUserHandler, loginUserHandler };