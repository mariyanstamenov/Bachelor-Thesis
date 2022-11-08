const Sequelize = require('sequelize');

const sequelize = require('../utils/database_config');

const Facilities = sequelize.define(
    'einrichtungen',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        name: {
            type: Sequelize.CHAR
        },
        type: {
            type: Sequelize.CHAR,
            length: 100
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

module.exports = Facilities;