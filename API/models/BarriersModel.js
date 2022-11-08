const Sequelize = require('sequelize');

const sequelize = require('../utils/database_config');

const Barriers = sequelize.define(
    'barrieren',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        geom_type: {
            type: Sequelize.TEXT
        },
        type: {
            type: Sequelize.CHAR
        },
        geom: {
            type: Sequelize.GEOMETRY
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = Barriers;