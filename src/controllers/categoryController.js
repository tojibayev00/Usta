/**
 * ============================================================
 * Controller — Category
 * ============================================================
 */

const categoryService = require('../services/categoryService');
const catchAsync = require('../utils/catchAsync');

const categoryController = {
  list: catchAsync(async (req, res) => {
    const categories = await categoryService.listAll();
    res.status(200).json({ success: true, data: categories });
  }),
};

module.exports = categoryController;
