const Residences = require('../models/ResidencesModel');
const sequelize = require('../utils/database_config');

exports.getAll = async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const lngMin = req.query.lngMin || null;
    const lngMax = req.query.lngMax || null;
    const latMin = req.query.latMin || null;
    const latMax = req.query.latMax || null;

    if (lngMin && lngMax && latMin && latMax) {
        const count = await sequelize.query('select count(*) as count from wohnorte where ST_WITHIN(geom, ST_MakeEnvelope(:lngMin, :lngMax, :latMin, :latMax, 4326))', {
            model: Residences,
            replacements: {
                lngMin: lngMin,
                lngMax: lngMax,
                latMin: latMin,
                latMax: latMax
            }
        });

        return sequelize.query('select * from wohnorte where ST_WITHIN(geom, ST_MakeEnvelope(:lngMin, :lngMax, :latMin, :latMax, 4326)) LIMIT :limit OFFSET :offset', {
            model: Residences,
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

    Residences.findAndCountAll({ limit: limit, offset: offset })
        .then((residences) => {
            res.status(200).json({
                success: true,
                data: residences
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};


exports.getResidence = async (req, res, next) => {
    let residenceId = parseInt(req.params.residenceId);

    Residences.findByPk(residenceId)
        .then((residence) => {
            res.status(200).json({
                success: true,
                data: residence
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};