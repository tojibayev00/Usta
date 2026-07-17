/**
 * ============================================================
 * Routes — /api/masters
 * ============================================================
 */

const express = require('express');
const masterController = require('../controllers/masterController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { listMastersQuerySchema } = require('../validators/masterValidator');

const router = express.Router();

// GET /api/masters?categoryId=..&sort=rating&onlineOnly=true&lat=..&lng=..
router.get('/', validate(listMastersQuerySchema, 'query'), masterController.list);

// GET /api/masters/:id — bitta usta profili (sharhlar bilan)
router.get('/:id', masterController.getById);

// PATCH /api/masters/me/online — faqat MASTER roli, o'z online holatini o'zgartiradi
router.patch('/me/online', authenticate, requireRole('MASTER'), masterController.setOnlineStatus);

module.exports = router;
