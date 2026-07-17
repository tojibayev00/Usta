/**
 * ============================================================
 * Service — Review
 * ------------------------------------------------------------
 * Sharh faqat COMPLETED holatidagi va hali sharh qoldirilmagan
 * buyurtma uchun yoziladi. Sharh qo'shilgach, ustaning
 * o'rtacha reytingi qayta hisoblanadi (denormalized cache
 * sifatida Master.ratingAvg / reviewsCount saqlanadi —
 * har safar AVG() hisoblamaslik uchun tezlik maqsadida).
 * ============================================================
 */

const orderRepository = require('../repositories/orderRepository');
const reviewRepository = require('../repositories/reviewRepository');
const masterRepository = require('../repositories/masterRepository');
const AppError = require('../utils/AppError');

const reviewService = {
  async createForOrder(orderId, customerId, { rating, text }) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw AppError.notFound('Buyurtma topilmadi');

    if (order.customerId !== customerId) {
      throw AppError.forbidden('Faqat o\'z buyurtmangizga sharh qoldira olasiz');
    }
    if (order.status !== 'COMPLETED') {
      throw AppError.badRequest('Sharh faqat yakunlangan buyurtmaga qoldiriladi', 'ORDER_NOT_COMPLETED');
    }
    if (order.review) {
      throw AppError.conflict('Bu buyurtmaga sharh allaqachon qoldirilgan', 'REVIEW_ALREADY_EXISTS');
    }

    const review = await reviewRepository.create({
      orderId,
      customerId,
      masterId: order.masterId,
      rating,
      text,
    });

    const { ratingAvg, reviewsCount } = await reviewRepository.aggregateForMaster(order.masterId);
    await masterRepository.updateRatingAggregate(order.masterId, ratingAvg, reviewsCount);

    return review;
  },
};

module.exports = reviewService;
