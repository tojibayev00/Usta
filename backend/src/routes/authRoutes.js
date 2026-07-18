/**
 * ============================================================
 * Routes — /api/auth
 * ============================================================
 */

const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { telegramLoginSchema, updateProfileSchema } = require('../validators/authValidator');

const router = express.Router();

// POST /api/auth/telegram — Telegram initData orqali login/registratsiya
router.post('/telegram', validate(telegramLoginSchema), authController.loginWithTelegram);

// GET /api/auth/me — joriy foydalanuvchi ma'lumotlari
router.get('/me', authenticate, authController.getMe);

// PATCH /api/auth/me — profilni yangilash (hozircha faqat telefon raqami)
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateMe);

module.exports = router;
