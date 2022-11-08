const Sequelize = require('sequelize');

const sequelize = require('../utils/database_config');

const StreetNetwork = sequelize.define(
    'strassennetzwerk',
    {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        length_m: {
            type: Sequelize.DOUBLE
        },
        length_weighted: {
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

module.exports = StreetNetwork;