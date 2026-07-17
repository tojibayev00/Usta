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

module.exports = { telegramLoginSchema };
