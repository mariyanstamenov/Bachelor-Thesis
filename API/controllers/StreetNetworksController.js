const StreetNetworks = require('../models/StreetNetworksModel');

exports.getAll = async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    StreetNetworks.findAll({ limit: limit, offset: offset })
        .then((networks) => {
            res.status(200).json({
                success: true,
                data: networks
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};


exports.getStreetNetwork = async (req, res, next) => {
    let streetNetworkId = parseInt(req.params.streetNetworkId);

    StreetNetworks.findByPk(streetNetworkId)
        .then((network) => {
            res.status(200).json({
                success: true,
                data: network
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                error: err,
                message: "Something went wrong.."
            });
        });
};