/**
 * ============================================================
 * Repository — Master
 * ------------------------------------------------------------
 * Ustalar ro'yxatini filtrlash/saralash shu yerda amalga
 * oshiriladi. Masofa bo'yicha saralash uchun Haversine
 * formulasidan foydalanamiz (PostGIS talab qilinmaydi,
 * kichik-o'rta miqyosdagi ilova uchun bu yetarli).
 * ============================================================
 */

const prisma = require('../config/prisma');

const masterRepository = {
  /**
   * Filtr + saralash bilan ustalar ro'yxatini qaytaradi.
   * @param {object} params
   */
  async findMany({ categoryId, onlineOnly, sort, lat, lng, skip, take }) {
    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(onlineOnly ? { isOnline: true } : {}),
    };

    // Masofa bo'yicha saralash Prisma darajasida mumkin emas (hisoblangan maydon),
    // shuning uchun 'distance' so'ralganda barcha mos yozuvlarni olib, JS'da saralaymiz.
    const needsDistanceSort = sort === 'distance' && lat != null && lng != null;

    const orderBy = {
      rating: { ratingAvg: 'desc' },
      price_asc: { basePrice: 'asc' },
      price_desc: { basePrice: 'desc' },
    }[sort];

    const [items, total] = await Promise.all([
      prisma.master.findMany({
        where,
        include: { user: true, category: true, skills: true },
        orderBy: needsDistanceSort ? undefined : orderBy || { ratingAvg: 'desc' },
        ...(needsDistanceSort ? {} : { skip, take }),
      }),
      prisma.master.count({ where }),
    ]);

    if (!needsDistanceSort) {
      return { items, total };
    }

    // Haversine formulasi bilan har bir ustagacha masofani hisoblaymiz
    const withDistance = items
      .map((m) => ({ ...m, distanceKm: haversineKm(lat, lng, m.latitude, m.longitude) }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    return { items: withDistance.slice(skip, skip + take), total };
  },

  findById(id) {
    return prisma.master.findUnique({
      where: { id },
      include: {
        user: true,
        category: true,
        skills: true,
        reviews: {
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  },

  findByUserId(userId) {
    return prisma.master.findUnique({ where: { userId } });
  },

  updateRatingAggregate(masterId, ratingAvg, reviewsCount) {
    return prisma.master.update({
      where: { id: masterId },
      data: { ratingAvg, reviewsCount },
    });
  },

  setOnlineStatus(masterId, isOnline) {
    return prisma.master.update({ where: { id: masterId }, data: { isOnline } });
  },

  // --- Admin bot uchun qo'shimcha metodlar ---------------------

  /** Admin panelidan usta profilini User bilan birga yaratadi */
  createWithUser({ telegramId, firstName, lastName, categoryId, bio, photo, experienceYrs, basePrice, skills }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { telegramId: BigInt(telegramId) },
        update: { firstName, lastName, role: 'MASTER' },
        create: { telegramId: BigInt(telegramId), firstName, lastName, role: 'MASTER' },
      });

      const master = await tx.master.create({
        data: {
          userId: user.id,
          categoryId,
          bio,
          photo,
          experienceYrs,
          basePrice,
          isOnline: true,
          isVerified: true,
        },
      });

      if (skills && skills.length) {
        await tx.masterSkill.createMany({
          data: skills.map((label) => ({ masterId: master.id, label })),
        });
      }

      return master;
    });
  },

  findAllForAdmin() {
    return prisma.master.findMany({
      include: { user: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async delete(masterId) {
    // Master o'chirilganda bog'liq User'ni o'chirmaymiz (buyurtma tarixi saqlanishi uchun),
    // faqat Master yozuvini olib tashlaymiz. Skills onDelete: Cascade orqali avtomatik ketadi.
    return prisma.master.delete({ where: { id: masterId } });
  },

  setVerified(masterId, isVerified) {
    return prisma.master.update({ where: { id: masterId }, data: { isVerified } });
  },
};

/** Ikki geografik nuqta orasidagi masofani km da qaytaradi (Haversine formulasi) */
function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null)) return null;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

module.exports = masterRepository;
