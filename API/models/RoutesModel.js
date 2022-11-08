const Sequelize = require('sequelize');

const sequelize = require('../utils/database_config');

const Routes = sequelize.define(
    'routen',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        id_wohnort: {
            type: Sequelize.INTEGER
        },
        id_einrichtung: {
            type: Sequelize.INTEGER
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

module.exports = Routes;