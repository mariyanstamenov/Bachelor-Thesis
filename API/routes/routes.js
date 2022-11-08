
const express = require("express");

const barriersController = require("../controllers/BarriersController");
const facilitiesController = require("../controllers/FacilitiesController");
const routesController = require("../controllers/RoutesController");
const streetNetworksController = require("../controllers/StreetNetworksController");
const residencesController = require("../controllers/ResidencesController");

const router = express.Router();

router.get("/barriers", barriersController.getAll);
router.get("/barriers/:barrierId", barriersController.getBarrier);

router.get("/facilities", facilitiesController.getAll);
router.get("/facilities/:facilityId/:residenceId", facilitiesController.getFacility);
router.get("/facilities/types", facilitiesController.getTypes);

router.get("/routes", routesController.getAll);
router.get("/routes/residence/:residenceId", routesController.getRouteByResidenceId);
router.get("/routes/facility/:facilityId", routesController.getRouteByFacilityId);

router.get("/streetNetworks", streetNetworksController.getAll);
router.get("/streetNetworks/:streetNetworkId", streetNetworksController.getStreetNetwork);

router.get("/residences", residencesController.getAll);
router.get("/residences/:residenceId", residencesController.getResidence);

module.exports = router;