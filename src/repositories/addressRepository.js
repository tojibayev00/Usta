/**
 * ============================================================
 * Repository — Address
 * ============================================================
 */

const prisma = require('../config/prisma');

const addressRepository = {
  findByUser(userId) {
    return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  findById(id) {
    return prisma.address.findUnique({ where: { id } });
  },

  create(data) {
    return prisma.address.create({ data });
  },

  /** Yangi manzil default qilinganda, boshqalarini default'dan chiqaradi */
  async setAsDefault(userId, addressId) {
    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
    ]);
  },

  delete(id) {
    return prisma.address.delete({ where: { id } });
  },
};

module.exports = addressRepository;
