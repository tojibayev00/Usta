/**
 * ============================================================
 * Repository — Order
 * ============================================================
 */

const prisma = require('../config/prisma');

const orderRepository = {
  create(data) {
    return prisma.order.create({
      data,
      include: { master: { include: { user: true } }, address: true },
    });
  },

  findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        master: { include: { user: true, category: true } },
        customer: true,
        address: true,
        statusEvents: { orderBy: { createdAt: 'asc' } },
        review: true,
      },
    });
  },

  findByCustomer(customerId, { skip, take }) {
    return prisma.order.findMany({
      where: { customerId },
      include: { master: { include: { user: true, category: true } }, review: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  findByMaster(masterId, { skip, take, status }) {
    return prisma.order.findMany({
      where: { masterId, ...(status ? { status } : {}) },
      include: { customer: true, address: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  updateStatus(orderId, status) {
    return prisma.order.update({ where: { id: orderId }, data: { status } });
  },

  addStatusEvent(orderId, status, note) {
    return prisma.orderStatusEvent.create({ data: { orderId, status, note } });
  },

  countByCustomer(customerId) {
    return prisma.order.count({ where: { customerId } });
  },
};

module.exports = orderRepository;
