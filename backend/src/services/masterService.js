/**
 * ============================================================
 * Service — Master
 * ============================================================
 */

const masterRepository = require('../repositories/masterRepository');
const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');

const masterService = {
  async list(query) {
    let categoryId = query.categoryId;

    if (!categoryId && query.categorySlug) {
      const category = await categoryRepository.findBySlug(query.categorySlug);
      if (!category) throw AppError.notFound('Kategoriya topilmadi');
      categoryId = category.id;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const { items, total } = await masterRepository.findMany({
      categoryId,
      onlineOnly: query.onlineOnly,
      sort: query.sort,
      lat: query.lat,
      lng: query.lng,
      region: query.region,
      district: query.district,
      village: query.village,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map(serializeMasterSummary),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  },

  async getById(id) {
    const master = await masterRepository.findById(id);
    if (!master) throw AppError.notFound('Usta topilmadi');
    return serializeMasterDetail(master);
  },

  async setOnlineStatus(masterUserId, isOnline) {
    const master = await masterRepository.findByUserId(masterUserId);
    if (!master) throw AppError.notFound('Usta profili topilmadi');
    const updated = await masterRepository.setOnlineStatus(master.id, isOnline);
    return serializeMasterSummary(updated);
  },

  /** Mijoz Web App ichida "Usta bo'lish" formasini to'ldirganda chaqiriladi */
  async registerSelf(userId, payload) {
    const existing = await masterRepository.findByUserId(userId);
    if (existing) {
      throw AppError.conflict("Siz allaqachon usta sifatida ro'yxatdan o'tgansiz", 'ALREADY_MASTER');
    }

    const category = await categoryRepository.findById(payload.categoryId);
    if (!category) throw AppError.notFound('Kategoriya topilmadi');

    const master = await masterRepository.createForExistingUser(userId, {
      categoryId: payload.categoryId,
      bio: payload.bio,
      photo: payload.photo || undefined,
      experienceYrs: payload.experienceYrs || 0,
      basePrice: payload.basePrice,
      region: payload.region,
      district: payload.district,
      village: payload.village,
      phone: payload.phone,
      skills: payload.skills || [],
    });

    return masterService.getById(master.id);
  },

  /** Ustaning o'zi (Profile sahifasida) o'z profilini ko'rishi uchun */
  async getMine(userId) {
    const master = await masterRepository.findByUserId(userId);
    if (!master) throw AppError.notFound('Sizda usta profili topilmadi');
    return masterService.getById(master.id);
  },
};

function serializeMasterSummary(m) {
  const locationParts = [m.region, m.district, m.village].filter(Boolean);
  return {
    id: m.id,
    name: `${m.user.firstName} ${m.user.lastName || ''}`.trim(),
    photo: m.photo || m.user.photoUrl,
    phone: m.user.phone || null,
    category: m.category ? { id: m.category.id, name: m.category.name, slug: m.category.slug } : undefined,
    rating: m.ratingAvg,
    reviewsCount: m.reviewsCount,
    experienceYears: m.experienceYrs,
    price: m.basePrice ?? null,
    region: m.region || null,
    district: m.district || null,
    village: m.village || null,
    location: locationParts.length ? locationParts.join(', ') : null,
    distanceKm: m.distanceKm ?? null,
    isOnline: m.isOnline,
    isVerified: m.isVerified,
    skills: m.skills ? m.skills.map((s) => s.label) : undefined,
  };
}

function serializeMasterDetail(m) {
  return {
    ...serializeMasterSummary(m),
    bio: m.bio,
    reviews: m.reviews?.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
      customerName: r.customer.firstName,
    })),
  };
}

module.exports = masterService;
