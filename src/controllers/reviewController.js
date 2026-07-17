/**
 * ============================================================
 * Controller — Review
 * ============================================================
 */

const reviewService = require('../services/reviewService');
const catchAsync = require('../utils/catchAsync');

const reviewController = {
  createForOrder: catchAsync(async (req, res) => {
    const review = await reviewService.createForOrder(req.params.orderId, req.user.id, req.body);
    res.status(201).json({ success: true, data: review });
  }),
};

module.exports = reviewController;
