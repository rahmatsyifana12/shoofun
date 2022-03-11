const jwt = require('jsonwebtoken');

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {*} next
 * @returns
 */
function auth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        next();
    } catch (e) {
        return res.status(401).json({
            status: 'fail',
            message: 'Unauthorized error'
        });
    }
}

module.exports = { auth };