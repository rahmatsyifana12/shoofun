const Pool = require('pg').Pool;
require('dotenv').config();
const { env } = process;

const pool = new Pool({
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    database: env.DB_DATABASE
});

module.exports = pool;