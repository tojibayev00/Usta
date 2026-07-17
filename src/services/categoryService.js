/**
 * ============================================================
 * Service — Category
 * ============================================================
 */

const categoryRepository = require('../repositories/categoryRepository');

const categoryService = {
  async listAll() {
    return categoryRepository.findAll();
  },
};

module.exports = categoryService;
