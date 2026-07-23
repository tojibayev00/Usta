/**
 * ============================================================
 * Routes — /api/masters
 * ============================================================
 */

const express = require('express');
const masterController = require('../controllers/masterController');
const { authenticate, requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { listMastersQuerySchema, registerMasterSchema } = require('../validators/masterValidator');

const router = express.Router();

// GET /api/masters?categoryId=..&sort=rating&onlineOnly=true&lat=..&lng=..
router.get('/', validate(listMastersQuerySchema, 'query'), masterController.list);

// POST /api/masters/register — mijoz o'zini usta sifatida ro'yxatdan o'tkazadi.
// MUHIM: bu yo'l '/:id' dinamik yo'lidan OLDIN turishi shart, aks holda
// Express "register" so'zini :id parametri deb qabul qilib qo'yadi.
router.post('/register', authenticate, validate(registerMasterSchema), masterController.registerSelf);

// PATCH /api/masters/me/online — faqat MASTER roli, o'z online holatini o'zgartiradi
router.patch('/me/online', authenticate, requireRole('MASTER'), masterController.setOnlineStatus);

// GET /api/masters/mine — ustaning o'z profilini ko'rishi (Profile sahifasida)
router.get('/mine', authenticate, requireRole('MASTER'), masterController.getMine);

// GET /api/masters/:id — bitta usta profili (sharhlar bilan)
router.get('/:id', masterController.getById);

module.exports = router;
