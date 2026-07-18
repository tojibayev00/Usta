/**
 * ============================================================
 * Config — Prisma Client (singleton)
 * ------------------------------------------------------------
 * Har bir fayl `new PrismaClient()` chaqirsa, dev rejimda
 * hot-reload paytida ko'p ulanish ochilib ketishi mumkin.
 * Shu sabab bitta instance yaratib, hamma joyda shundan
 * foydalanamiz.
 * ============================================================
 */

const { PrismaClient } = require('@prisma/client');
const config = require('./env');

const prisma = new PrismaClient({
  log: config.env === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
