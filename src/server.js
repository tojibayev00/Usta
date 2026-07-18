/**
 * ============================================================
 * Server — kirish nuqtasi
 * ============================================================
 */

const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/prisma');
const { startAdminBot } = require('./bot/adminBot');

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[UstaTop API] ${config.env} rejimida ${config.port}-portda ishga tushdi`);
});

// Admin bot — Web App bilan bir xil tokenni ishlatib, faqat
// ADMIN_TELEGRAM_ID'dan kelgan buyruqlarga javob beradi.
startAdminBot();

/** Server yopilganda Prisma ulanishini ham to'g'ri yopish uchun */
async function gracefulShutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n[UstaTop API] ${signal} qabul qilindi, server to'xtatilmoqda...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
