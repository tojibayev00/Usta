/**
 * ============================================================
 * Routes — index (barcha /api/* yo'llarni birlashtiradi)
 * ============================================================
 */

const express = require('express');

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const masterRoutes = require('./masterRoutes');
const orderRoutes = require('./orderRoutes');
const addressRoutes = require('./addressRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/masters', masterRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);

module.exports = router;
