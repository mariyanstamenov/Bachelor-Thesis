const Sequelize = require('sequelize');

const sequelize = require('../utils/database_config');

const Residences = sequelize.define(
    'wohnorte',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        n_seniors: {
            type: Sequelize.INTEGER
        },
        walkscore: {
            type: Sequelize.DOUBLE
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

module.exports = Residences;