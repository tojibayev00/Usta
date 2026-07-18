/**
 * ============================================================
 * Repository — Category
 * ============================================================
 */

const prisma = require('../config/prisma');

const categoryRepository = {
  findAll() {
    return prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  },

  findById(id) {
    return prisma.category.findUnique({ where: { id } });
  },

  findBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
  },
};

module.exports = categoryRepository;
