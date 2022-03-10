const express = require('express');
const routes = require('./routes');
const pool = require('./db');

require('dotenv').config();

const app = express();
const port = 5000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.listen(port, () => {
    try {
        // Initialize all tables
        pool.query(
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL NOT NULL PRIMARY KEY,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                display_name VARCHAR(255) NOT NULL,
                address VARCHAR(255) NOT NULL,
                phone_number VARCHAR(255) NOT NULL
            );`
        );

        pool.query(
            `CREATE TABLE IF NOT EXISTS products (
                id SERIAL NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price INT NOT NULL,
                description VARCHAR(255) NOT NULL,
                weight DECIMAL(11,2) NOT NULL,
                is_deleted BOOLEAN NOT NULL
            );`
        );

        pool.query(
            `CREATE TABLE IF NOT EXISTS orders (
                id SERIAL NOT NULL PRIMARY KEY,
                user_id INT NOT NULL,
                order_date DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );`
        );

        pool.query(
            `CREATE TABLE IF NOT EXISTS order_details (
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                current_price INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            );`
        );

        pool.query(
            `CREATE TABLE IF NOT EXISTS carts (
                id SERIAL NOT NULL PRIMARY KEY,
                user_id INT NOT NULL,
                status BIT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );`
        );

        pool.query(
            `CREATE TABLE IF NOT EXISTS cart_products (
                cart_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (cart_id) REFERENCES carts(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            );`
        );
    } catch (err) {
        console.error(err);
        return;
    }

    console.log(`Server is running at http://localhost:${port}`);
});