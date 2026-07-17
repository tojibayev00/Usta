/**
 * ============================================================
 * Repository — User
 * ------------------------------------------------------------
 * Repository qatlami faqat ma'lumotlar bazasi bilan gaplashadi.
 * Biznes-logika bu yerda YO'Q — u service qatlamida.
 * Shu tufayli kelajakda Prisma o'rniga boshqa ORM'ga
 * o'tilsa, faqat shu fayllar o'zgaradi.
 * ============================================================
 */

const prisma = require('../config/prisma');

const userRepository = {
  findByTelegramId(telegramId) {
    return prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data) {
    return prisma.user.create({ data });
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },
};

module.exports = userRepository;
