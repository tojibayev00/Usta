/**
 * ============================================================
 * Config — Environment o'zgaruvchilarini bir joyda jamlash
 * ------------------------------------------------------------
 * Boshqa fayllar process.env ga to'g'ridan-to'g'ri murojaat
 * qilmasin, shu modulni import qilsin. Shunday qilinsa:
 *  - talab qilinadigan o'zgaruvchi yo'qligi ilova boshlanishida
 *    darhol aniqlanadi (fail-fast),
 *  - qiymatlarni bir joydan boshqarish oson bo'ladi.
 * ============================================================
 */

require('dotenv').config();

const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET', 'TELEGRAM_BOT_TOKEN'];

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`[config] Majburiy environment o'zgaruvchi topilmadi: ${key}`);
    process.exit(1);
  }
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },

  cors: {
    origins: (process.env.CORS_ORIGIN || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
};

module.exports = config;
