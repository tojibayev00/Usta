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
};

function serializeMasterSummary(m) {
  const locationParts = [m.region, m.district].filter(Boolean);
  return {
    id: m.id,
    name: `${m.user.firstName} ${m.user.lastName || ''}`.trim(),
    photo: m.photo || m.user.photoUrl,
    category: m.category ? { id: m.category.id, name: m.category.name, slug: m.category.slug } : undefined,
    rating: m.ratingAvg,
    reviewsCount: m.reviewsCount,
    experienceYears: m.experienceYrs,
    price: m.basePrice,
    region: m.region || null,
    district: m.district || null,
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
