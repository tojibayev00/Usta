/**
 * ============================================================
 * Prisma Seed — boshlang'ich ma'lumotlar
 * ------------------------------------------------------------
 * Ishga tushirish: npm run prisma:seed
 * Frontenddagi js/data.js dagi kategoriyalar va namunaviy
 * ustalarga mos ravishda tayyorlangan.
 * ============================================================
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'plumber', name: 'Santexnik', icon: 'wrench', sortOrder: 1 },
  { slug: 'electrician', name: 'Elektrik', icon: 'bolt', sortOrder: 2 },
  { slug: 'ac', name: 'Konditsioner', icon: 'snow', sortOrder: 3 },
  { slug: 'carpenter', name: 'Duradgor', icon: 'hammer', sortOrder: 4 },
  { slug: 'painter', name: "Bo'yoqchi", icon: 'roller', sortOrder: 5 },
  { slug: 'cleaner', name: 'Tozalash', icon: 'sparkle', sortOrder: 6 },
  { slug: 'appliance', name: 'Maishiy texnika', icon: 'device', sortOrder: 7 },
  { slug: 'locksmith', name: 'Chilangar', icon: 'key', sortOrder: 8 },
];

const MASTERS = [
  {
    telegramId: 1000001,
    firstName: 'Sardor',
    lastName: 'Aliyev',
    categorySlug: 'plumber',
    bio: "Santexnika sohasida 8 yillik tajribaga ega usta. Quvur almashtirish, sizimlarni bartaraf etish va isitish tizimlarini o'rnatish bo'yicha mutaxassis.",
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    experienceYrs: 8,
    basePrice: 80000,
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    village: null,
    latitude: 41.2995,
    longitude: 69.2401,
    isOnline: true,
    isVerified: true,
    skills: ["Quvur ta'mirlash", "Unitaz o'rnatish", 'Isitish tizimi', 'Sizim bartaraf etish'],
  },
  {
    telegramId: 1000002,
    firstName: 'Bobur',
    lastName: 'Karimov',
    categorySlug: 'electrician',
    bio: "Elektr montaj ishlari, rozetka va yoritish tizimlarini o'rnatish, avariya holatlarini bartaraf etish bo'yicha mutaxassis.",
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    experienceYrs: 6,
    basePrice: 70000,
    region: 'Toshkent shahri',
    district: 'Yunusobod tumani',
    latitude: 41.311,
    longitude: 69.279,
    isOnline: true,
    isVerified: true,
    skills: ['Elektr montaj', "Rozetka o'rnatish", 'Yoritish tizimi', 'Avtomat almashtirish'],
  },
  {
    telegramId: 1000003,
    firstName: 'Otabek',
    lastName: 'Yusupov',
    categorySlug: 'ac',
    bio: "Konditsioner o'rnatish, tozalash va frion to'ldirish xizmatlari. Barcha brendlar bilan ishlayman.",
    photo: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=400&h=400&fit=crop',
    experienceYrs: 5,
    basePrice: 120000,
    region: 'Toshkent shahri',
    district: 'Mirzo Ulug\'bek tumani',
    latitude: 41.29,
    longitude: 69.25,
    isOnline: true,
    isVerified: true,
    skills: ["O'rnatish", 'Tozalash', "Frion to'ldirish", 'Diagnostika'],
  },
  {
    telegramId: 1000004,
    firstName: 'Sherzod',
    lastName: 'Nomozov',
    categorySlug: 'plumber',
    bio: 'Uy va ofis santexnika ishlarini bajaraman. Tez va sifatli xizmat kafolatlanadi.',
    photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop',
    experienceYrs: 4,
    basePrice: 65000,
    region: 'Toshkent viloyati',
    district: 'Zangiota tumani',
    latitude: 41.28,
    longitude: 69.21,
    isOnline: false,
    isVerified: false,
    skills: ['Quvur almashtirish', 'Aralashtirgich', 'Kanalizatsiya'],
  },
  {
    telegramId: 1000005,
    firstName: 'Jahongir',
    lastName: 'Ergashev',
    categorySlug: 'carpenter',
    bio: "Mebel ta'mirlash, eshik-deraza o'rnatish va boshqa yog'och ishlari bo'yicha usta.",
    photo: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=400&h=400&fit=crop',
    experienceYrs: 10,
    basePrice: 95000,
    region: 'Toshkent shahri',
    district: 'Mirobod tumani',
    latitude: 41.33,
    longitude: 69.29,
    isOnline: true,
    isVerified: true,
    skills: ["Mebel ta'mirlash", "Eshik o'rnatish", "Yog'och ishlash"],
  },
];

async function main() {
  console.log('Seed boshlandi...');

  // 1) Kategoriyalar (idempotent: mavjud bo'lsa yangilaydi, bo'lmasa yaratadi)
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`${CATEGORIES.length} ta kategoriya tayyor.`);

  // 2) Namunaviy ustalar (har biri uchun User + Master + Skills)
  for (const m of MASTERS) {
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(m.telegramId) },
      update: {},
      create: {
        telegramId: BigInt(m.telegramId),
        firstName: m.firstName,
        lastName: m.lastName,
        role: 'MASTER',
      },
    });

    const existingMaster = await prisma.master.findUnique({ where: { userId: user.id } });
    if (existingMaster) continue; // Qayta ishga tushirilganda dublikat yaratmaslik uchun

    const master = await prisma.master.create({
      data: {
        userId: user.id,
        categoryId: categoryMap[m.categorySlug],
        bio: m.bio,
        photo: m.photo,
        experienceYrs: m.experienceYrs,
        basePrice: m.basePrice,
        region: m.region,
        district: m.district,
        village: m.village || null,
        latitude: m.latitude,
        longitude: m.longitude,
        isOnline: m.isOnline,
        isVerified: m.isVerified,
      },
    });

    await prisma.masterSkill.createMany({
      data: m.skills.map((label) => ({ masterId: master.id, label })),
    });
  }
  console.log(`${MASTERS.length} ta namunaviy usta tayyor.`);

  console.log('Seed muvaffaqiyatli yakunlandi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
