/**
 * ============================================================
 * Validators — Auth
 * ============================================================
 */

const { z } = require('zod');

// Telegram Web App yuboradigan initData qatorini tekshirish uchun
const telegramLoginSchema = z.object({
  initData: z.string().min(1, "initData bo'sh bo'lishi mumkin emas"),
});

const updateProfileSchema = z.object({
  phone: z.string().min(7).max(20).optional(),
});

module.exports = { telegramLoginSchema, updateProfileSchema };
