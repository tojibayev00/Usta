/**
 * ============================================================
 * Service — Order
 * ------------------------------------------------------------
 * Buyurtmaning butun hayotiy davri shu yerda boshqariladi:
 * yaratish -> status o'zgarishlari -> yakunlash.
 *
 * Status o'zgarishi erkin emas — ORDER_STATUS_FLOW orqali
 * qaysi statusdan qaysi statusga o'tish mumkinligi
 * qat'iy belgilangan (holatlar mashinasi / state machine).
 * Bu frontenddagi "Live status" bosqichlariga bevosita mos keladi:
 * PENDING -> ACCEPTED -> ON_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED
 * ============================================================
 */

const orderRepository = require('../repositories/orderRepository');
const masterRepository = require('../repositories/masterRepository');
const addressRepository = require('../repositories/addressRepository');
const AppError = require('../utils/AppError');

// Ruxsat etilgan status o'tishlari
const ORDER_STATUS_FLOW = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['ON_WAY', 'CANCELLED'],
  ON_WAY: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const orderService = {
  /**
   * Yangi buyurtma yaratadi. Agar `address.id` berilmagan bo'lsa,
   * yangi manzil sifatida saqlaydi. Narx endi qat'iy hisoblanmaydi —
   * mijoz va usta o'zaro kelishadi; basePrice faqat taxminiy ma'lumot
   * sifatida ko'rsatiladi (agar usta uni ko'rsatgan bo'lsa).
   */
  async create(customerId, payload) {
    const master = await masterRepository.findById(payload.masterId);
    if (!master) throw AppError.notFound('Usta topilmadi');

    let addressId = payload.address.id;
    if (!addressId) {
      const newAddress = await addressRepository.create({
        userId: customerId,
        title: payload.address.title || 'Manzil',
        fullText: payload.address.fullText,
        latitude: payload.address.latitude,
        longitude: payload.address.longitude,
      });
      addressId = newAddress.id;
    }

    const order = await orderRepository.create({
      customerId,
      masterId: master.id,
      addressId,
      scheduledAt: new Date(payload.scheduledAt),
      note: payload.note,
      servicePrice: master.basePrice ?? null,
      serviceFee: 0,
      totalPrice: master.basePrice ?? null,
      status: 'PENDING',
    });

    await orderRepository.addStatusEvent(order.id, 'PENDING', 'Buyurtma yuborildi');

    return serializeOrder(order);
  },

  async getById(orderId, requesterId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw AppError.notFound('Buyurtma topilmadi');

    // Faqat shu buyurtmaning mijozi yoki ustasi ko'ra oladi
    const isOwner = order.customerId === requesterId || order.master.userId === requesterId;
    if (!isOwner) throw AppError.forbidden('Bu buyurtmani ko\'rish uchun ruxsatingiz yo\'q');

    return serializeOrder(order);
  },

  async listForCustomer(customerId, { page = 1, pageSize = 20 } = {}) {
    const items = await orderRepository.findByCustomer(customerId, {
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return items.map(serializeOrderSummary);
  },

  async listForMaster(masterUserId, { page = 1, pageSize = 20, status } = {}) {
    const master = await masterRepository.findByUserId(masterUserId);
    if (!master) throw AppError.notFound('Usta profili topilmadi');

    const items = await orderRepository.findByMaster(master.id, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      status,
    });
    return items.map(serializeOrderSummary);
  },

  /**
   * Buyurtma statusini o'zgartiradi. Faqat state machine'da
   * ruxsat etilgan o'tishlarga yo'l qo'yiladi.
   */
  async updateStatus(orderId, requesterId, newStatus, note) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw AppError.notFound('Buyurtma topilmadi');

    const isMaster = order.master.userId === requesterId;
    const isCustomer = order.customerId === requesterId;
    if (!isMaster && !isCustomer) {
      throw AppError.forbidden('Bu buyurtmani o\'zgartirish uchun ruxsatingiz yo\'q');
    }

    // Mijoz faqat bekor qila oladi, boshqa statuslarni faqat usta o'zgartiradi
    if (isCustomer && newStatus !== 'CANCELLED') {
      throw AppError.forbidden('Mijoz faqat buyurtmani bekor qila oladi');
    }

    const allowedNext = ORDER_STATUS_FLOW[order.status] || [];
    if (!allowedNext.includes(newStatus)) {
      throw AppError.badRequest(
        `"${order.status}" holatidan "${newStatus}" holatiga o'tib bo'lmaydi`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    await orderRepository.updateStatus(orderId, newStatus);
    await orderRepository.addStatusEvent(orderId, newStatus, note);

    return orderService.getById(orderId, requesterId);
  },
};

function serializeOrder(order) {
  return {
    id: order.id,
    status: order.status,
    scheduledAt: order.scheduledAt,
    note: order.note,
    servicePrice: order.servicePrice,
    serviceFee: order.serviceFee,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    master: order.master
      ? {
          id: order.master.id,
          name: `${order.master.user.firstName} ${order.master.user.lastName || ''}`.trim(),
          photo: order.master.photo || order.master.user.photoUrl,
          category: order.master.category?.name,
        }
      : undefined,
    address: order.address
      ? { id: order.address.id, fullText: order.address.fullText }
      : undefined,
    statusEvents: order.statusEvents?.map((e) => ({
      status: e.status,
      note: e.note,
      createdAt: e.createdAt,
    })),
  };
}

function serializeOrderSummary(order) {
  return {
    id: order.id,
    status: order.status,
    scheduledAt: order.scheduledAt,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    hasReview: !!order.review,
    master: order.master
      ? {
          id: order.master.id,
          name: `${order.master.user.firstName} ${order.master.user.lastName || ''}`.trim(),
          photo: order.master.photo || order.master.user.photoUrl,
          category: order.master.category?.name,
        }
      : undefined,
    customer: order.customer
      ? { id: order.customer.id, name: order.customer.firstName }
      : undefined,
  };
}

module.exports = { orderService, ORDER_STATUS_FLOW };
