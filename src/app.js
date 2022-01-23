const express = require('express');
const routes = require('./routes');
require("dotenv").config();

const app = express();
const port = 5000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
});