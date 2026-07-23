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
  region: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  village: z.string().max(100).optional(),
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

// Mijoz "Usta sifatida ro'yxatdan o'tish" formasini to'ldirganda
const registerMasterSchema = z.object({
  categoryId: z.string().uuid('Kategoriyani tanlang'),
  region: z.string().min(1, 'Viloyatni tanlang'),
  district: z.string().min(1, 'Tumanni tanlang'),
  village: z.string().max(150).optional(),
  phone: z.string().min(7, "Telefon raqamini kiriting").max(20),
  experienceYrs: z.coerce.number().int().min(0).max(60).optional().default(0),
  basePrice: z.coerce.number().int().min(0).optional(),
  bio: z.string().max(1000).optional(),
  photo: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string().max(60)).max(15).optional(),
});

module.exports = { listMastersQuerySchema, createAddressSchema, registerMasterSchema };
