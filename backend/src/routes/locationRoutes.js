/**
 * ============================================================
 * Routes — /api/locations
 * ============================================================
 */

const express = require('express');
const locationController = require('../controllers/locationController');

const router = express.Router();

// GET /api/locations/regions — barcha viloyatlar
router.get('/regions', locationController.listRegions);

// GET /api/locations/districts?region=Toshkent%20shahri — tanlangan viloyat tumanlari
router.get('/districts', locationController.listDistricts);

module.exports = router;
