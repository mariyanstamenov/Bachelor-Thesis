const Barriers = require('../models/BarriersModel');

exports.getAll = async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    Barriers.findAll({ limit, offset })
        .then((barriers) => {
            res.status(200).json({
                success: true,
                data: barriers
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};


exports.getBarrier = async (req, res, next) => {
    let barrierId = parseInt(req.params.barrierId);

    Barriers.findByPk(barrierId)
        .then((barrier) => {
            res.status(200).json({
                success: true,
                data: barrier
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};