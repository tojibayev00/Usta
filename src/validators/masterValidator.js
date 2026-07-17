/**
 * ============================================================
 * Validators — Master listing filters, Address
 * ============================================================
 */

const { z } = require('zod');

const listMastersQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  sort: z.enum(['rating', 'distance', 'price_asc', 'price_desc']).optional(),
  onlineOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

const createAddressSchema = z.object({
  title: z.string().min(1),
  fullText: z.string().min(3),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

module.exports = { listMastersQuerySchema, createAddressSchema };
