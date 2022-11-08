const Facilities = require('../models/FacilitiesModel');
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
        const count = await sequelize.query('select count(*) as count from einrichtungen where ST_WITHIN(geom, ST_MakeEnvelope(:lngMin, :lngMax, :latMin, :latMax, 4326))', {
            model: Facilities,
            replacements: {
                lngMin: lngMin,
                lngMax: lngMax,
                latMin: latMin,
                latMax: latMax
            }
        });

        return sequelize.query('select * from einrichtungen where ST_WITHIN(geom, ST_MakeEnvelope(:lngMin, :lngMax, :latMin, :latMax, 4326)) LIMIT :limit OFFSET :offset', {
            model: Facilities,
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

    Facilities.findAll({ limit: limit, offset: offset })
        .then((facilities) => {
            res.status(200).json({
                success: true,
                data: facilities
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};


exports.getFacility = async (req, res, next) => {
    let facilityId = parseInt(req.params.facilityId);
    let residenceId = parseInt(req.params.residenceId);

    sequelize.query("select einrichtungen.id as id, einrichtungen.name as name, einrichtungen.type as type, einrichtungen.geom as geom, ST_Length(ST_Transform(routen.geom, 25832)) as length FROM routen inner join einrichtungen on einrichtungen.id = routen.id_einrichtung where id_wohnort = :id_wohnort and id_einrichtung = :id_einrichtung", {
        model: Routes,
        replacements: {
            id_wohnort: residenceId,
            id_einrichtung: facilityId
        }
    })
        .then((facility) => {
            res.status(200).json({
                success: true,
                data: facility[0] || facility
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};

exports.getTypes = async (req, res, next) => {

    sequelize.query("select count(*), einrichtungen.type from einrichtungen group by einrichtungen.type", {
        model: Facilities
    })
        .then((data) => {
            res.status(200).json({
                success: true,
                data: data
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
}