/**
 * ============================================================
 * Routes — /api/categories
 * ============================================================
 */

const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// GET /api/categories — barcha xizmat kategoriyalari
router.get('/', categoryController.list);

module.exports = router;
