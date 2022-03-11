const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { newUserSchema } = require('./validations/user.validation');

async function addNewUser(req, res) {
    const valResult = newUserSchema.validate(req.body);

    if (valResult.error) {
        console.error(valResult);
        return res.status(400).json({
            status: 'fail',
            message: 'Object or value is invalid'
        });
    }

    const {
        email, password, displayName, address, phoneNumber
    } = req.body;

    try {
        const allUsers = await pool.query('SELECT * FROM users WHERE email = $1;', [email]);
        if (allUsers.rows.length) {
            return res.status(400).json({
                status: 'fail',
                message: 'This account is already exist'
            });
        }
    } catch (err) {
        console.error(err);
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    try {
        await pool.query(
            `INSERT INTO users (email, password, display_name, address, phone_number)
            VALUES ($1, $2, $3, $4, $5);`,
            [email, hashedPassword, displayName, address, phoneNumber]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Successfully registered a new account'
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
}

async function loginUserHandler(req, res) {
    const { email, password } = req.body;
    const msg = { status: 'success', message: 'Successfully login' };
    let foundUser;

    try {
        foundUser = await pool.query(
            'SELECT * FROM users WHERE email=$1;', [email]
        );

        if (!foundUser.rows.length) {
            return res.status(400).json({
                status: 'fail',
                message: 'Account doesn\'t exist'
            });
        }
    } catch (err) {
        console.error(err);
    }

    try {
        if (!bcrypt.compareSync(password, foundUser.rows[0].password)) {
            msg.status = 'fail';
            msg.message = 'Object or value is invalid';

            return res.status(400).json({
                status: 'fail',
                message: 'Object or value is invalid'
            });
        }
        const token = jwt.sign(
            {
                userId: foundUser.rows[0].id,
                email: foundUser.rows[0].email
            },
            process.env.ACCESS_TOKEN_SECRET
        );

        return res.status(200).json({
            status: 'success',
            message: 'Successfully login',
            data: {
                token
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            message: 'Unexpected server error'
        });
    }
}

module.exports = { addNewUser, loginUserHandler };