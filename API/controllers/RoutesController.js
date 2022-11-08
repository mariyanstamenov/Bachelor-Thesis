const Routes = require('../models/RoutesModel');
const sequelize = require('../utils/database_config');

exports.getAll = async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const lngMin = req.query.lngMin || null;
    const lngMax = req.query.lngMax || null;
    const latMin = req.query.latMin || null;
    const latMax = req.query.latMax || null;

    if (lngMin && lngMax && latMin && latMax) {
        const count = await sequelize.query('select count(*) as count from routen where ST_WITHIN(geom, ST_MakeEnvelope(:lngMin, :lngMax, :latMin, :latMax, 4326))', {
            model: Routes,
            replacements: {
                lngMin: lngMin,
                lngMax: lngMax,
                latMin: latMin,
                latMax: latMax,
                limit: limit,
                offset: offset
            }
        });

        return sequelize.query('select * from routen where ST_WITHIN(geom, ST_MakeEnvelope(:lngMin, :lngMax, :latMin, :latMax, 4326)) LIMIT :limit OFFSET :offset', {
            model: Routes,
            replacements: {
                lngMin: lngMin,
                lngMax: lngMax,
                latMin: latMin,
                latMax: latMax,
                limit: limit,
                offset: offset
            }
        }).then((routes) => {
            res.status(200).json({
                success: true,
                total: count[0],
                data: routes
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
    }

    Routes.findAndCountAll({ limit: limit, offset: offset })
        .then((routes) => {
            res.status(200).json({
                success: true,
                data: routes
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};

exports.getRouteByResidenceId = async (req, res, next) => {
    let residenceId = parseInt(req.params.residenceId);

    Routes.findAll({
        attributes: ["id", "id_wohnort", "id_einrichtung", "geom", ["ST_Length(ST_Transform(geom, 25832))", "length"]],
        where: {
            id_wohnort: residenceId
        }
    })
        .then((route) => {
            res.status(200).json({
                success: true,
                data: route
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};

exports.getRouteByFacilityId = async (req, res, next) => {
    let facilityId = parseInt(req.params.facilityId);

    Routes.findAll({
        where: {
            id_einrichtung: facilityId
        }
    })
        .then((route) => {
            res.status(200).json({
                success: true,
                data: route
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};