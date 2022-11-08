const express = require('express');
const bodyParser = require("body-parser");
require('dotenv').config()

const sequelize = require("./utils/database_config");
const routes = require("./routes/routes");

const app = express();
const PORT = process.env.SERVER_PORT || 8001;

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use('/api', routes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ success: false, message: message, data: data });
});

// connect sequelize
sequelize
    .sync()
    .then((result) => {
        console.log(`API listening on PORT ${PORT}`);
        console.log("Press Ctrl+C to quit.");

        // start server
        app.listen(PORT);
    })
    .catch((err) => {
        console.log("Something went wrong...\n", err);
    });