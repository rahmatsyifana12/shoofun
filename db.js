const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: 'kjsuhwkr',
    host: 'localhost',
    port: 5432,
    database: 'shoofun'
});

module.exports = pool;