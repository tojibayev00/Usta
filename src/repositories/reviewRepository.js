/**
 * ============================================================
 * Repository — Review
 * ============================================================
 */

const prisma = require('../config/prisma');

const reviewRepository = {
  create(data) {
    return prisma.review.create({ data });
  },

  findByMaster(masterId, { skip, take }) {
    return prisma.review.findMany({
      where: { masterId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  /** Ustaning o'rtacha reytingi va sharhlar sonini qayta hisoblaydi */
  async aggregateForMaster(masterId) {
    const result = await prisma.review.aggregate({
      where: { masterId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      ratingAvg: result._avg.rating || 0,
      reviewsCount: result._count.rating || 0,
    };
  },
};

module.exports = reviewRepository;
