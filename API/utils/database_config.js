const Sequelize = require('sequelize');

const env = process.env;

const config = {
    host: env.PG_HOST,
    port: env.PG_PORT,
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DATABASE,
    dialect: env.PG_DIALECT
};

const sequelize = new Sequelize(config.database, config.user, config.password, {
    dialect: config.dialect,
    port: config.port
});

module.exports = sequelize;