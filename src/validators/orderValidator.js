/**
 * ============================================================
 * Validators — Order
 * ============================================================
 */

const { z } = require('zod');

const createOrderSchema = z.object({
  masterId: z.string().uuid('masterId to\'g\'ri UUID bo\'lishi kerak'),
  scheduledAt: z.string().datetime({ message: 'scheduledAt ISO 8601 formatida bo\'lishi kerak' }),
  note: z.string().max(500).optional(),
  address: z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).optional(),
    fullText: z.string().min(3, 'Manzil kamida 3 belgidan iborat bo\'lishi kerak'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'ON_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  note: z.string().max(300).optional(),
});

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});

module.exports = { createOrderSchema, updateOrderStatusSchema, createReviewSchema };
