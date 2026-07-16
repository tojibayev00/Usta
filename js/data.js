/**
 * ============================================================
 * USTATOP — Mock Data Layer
 * ------------------------------------------------------------
 * Backend tayyor bo'lgach bu fayl REST API chaqiruvlariga
 * almashtiriladi (masalan: GET /api/categories, GET /api/masters).
 * Hozircha frontendni mustaqil ishlashi uchun statik ma'lumot.
 * ============================================================
 */

// --- Xizmat kategoriyalari -----------------------------------
const CATEGORIES = [
  { id: 'plumber',    name: 'Santexnik',        icon: 'wrench',    count: 128 },
  { id: 'electrician', name: 'Elektrik',        icon: 'bolt',      count: 96  },
  { id: 'ac',         name: 'Konditsioner',      icon: 'snow',      count: 74  },
  { id: 'carpenter',  name: 'Duradgor',          icon: 'hammer',    count: 61  },
  { id: 'painter',    name: "Bo'yoqchi",         icon: 'roller',    count: 47  },
  { id: 'cleaner',    name: 'Tozalash',          icon: 'sparkle',   count: 83  },
  { id: 'appliance',  name: 'Maishiy texnika',   icon: 'device',    count: 59  },
  { id: 'locksmith',  name: 'Chilangar',         icon: 'key',       count: 32  },
];

// --- Ustalar ro'yxati -----------------------------------------
const MASTERS = [
  {
    id: 'm1',
    name: 'Sardor Aliyev',
    category: 'plumber',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewsCount: 214,
    experience: '8 yil tajriba',
    price: 80000,
    distanceKm: 1.2,
    etaMin: 15,
    online: true,
    bio: "Santexnika sohasida 8 yillik tajribaga ega usta. Quvur almashtirish, sizimlarni bartaraf etish va isitish tizimlarini o'rnatish bo'yicha mutaxassis.",
    skills: ["Quvur ta'mirlash", "Unitaz o'rnatish", 'Isitish tizimi', "Sizim bartaraf etish"],
    reviews: [
      { name: 'Dilnoza R.', rating: 5, date: '2 kun oldin', text: 'Juda tez va sifatli ishladi. Narxi ham mos edi, albatta tavsiya qilaman!' },
      { name: 'Jasur T.', rating: 5, date: '1 hafta oldin', text: 'Vaqtida keldi, muammoni tezda hal qildi. Rahmat!' },
      { name: 'Nodira K.', rating: 4, date: '2 hafta oldin', text: 'Yaxshi ishladi, lekin biroz kechikib keldi.' },
    ],
  },
  {
    id: 'm2',
    name: 'Bobur Karimov',
    category: 'electrician',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewsCount: 178,
    experience: '6 yil tajriba',
    price: 70000,
    distanceKm: 2.4,
    etaMin: 22,
    online: true,
    bio: "Elektr montaj ishlari, rozetka va yoritish tizimlarini o'rnatish, avariya holatlarini bartaraf etish bo'yicha mutaxassis.",
    skills: ['Elektr montaj', "Rozetka o'rnatish", 'Yoritish tizimi', 'Avtomat almashtirish'],
    reviews: [
      { name: 'Aziz M.', rating: 5, date: '3 kun oldin', text: 'Professional yondashuv, hammasi tartibda.' },
      { name: 'Kamola S.', rating: 5, date: '5 kun oldin', text: 'Juda ehtiyotkor va aniq ishladi, tavsiya qilaman.' },
    ],
  },
  {
    id: 'm3',
    name: 'Otabek Yusupov',
    category: 'ac',
    photo: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=400&h=400&fit=crop',
    rating: 5.0,
    reviewsCount: 96,
    experience: '5 yil tajriba',
    price: 120000,
    distanceKm: 0.8,
    etaMin: 12,
    online: true,
    bio: "Konditsioner o'rnatish, tozalash va frion to'ldirish xizmatlari. Barcha brendlar bilan ishlayman.",
    skills: ["O'rnatish", 'Tozalash', "Frion to'ldirish", 'Diagnostika'],
    reviews: [
      { name: 'Farrux B.', rating: 5, date: '1 kun oldin', text: "Zo'r mutaxassis, tez va toza ishladi." },
      { name: 'Malika A.', rating: 5, date: '4 kun oldin', text: "Konditsionerni professional tarzda o'rnatib berdi." },
    ],
  },
  {
    id: 'm4',
    name: 'Sherzod Nomozov',
    category: 'plumber',
    photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop',
    rating: 4.7,
    reviewsCount: 142,
    experience: '4 yil tajriba',
    price: 65000,
    distanceKm: 3.1,
    etaMin: 28,
    online: false,
    bio: "Uy va ofis santexnika ishlarini bajaraman. Tez va sifatli xizmat kafolatlanadi.",
    skills: ['Quvur almashtirish', 'Aralashtirgich', 'Kanalizatsiya'],
    reviews: [
      { name: 'Umid F.', rating: 4, date: '1 hafta oldin', text: 'Yaxshi ishladi, narxi ham arzon.' },
    ],
  },
  {
    id: 'm5',
    name: 'Jahongir Ergashev',
    category: 'carpenter',
    photo: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewsCount: 87,
    experience: '10 yil tajriba',
    price: 95000,
    distanceKm: 4.5,
    etaMin: 35,
    online: true,
    bio: "Mebel ta'mirlash, eshik-deraza o'rnatish va boshqa yog'och ishlari bo'yicha usta.",
    skills: ["Mebel ta'mirlash", "Eshik o'rnatish", "Yog'och ishlash"],
    reviews: [
      { name: 'Shoxrux D.', rating: 5, date: '2 hafta oldin', text: "Ustaxonadagidek sifatli ish, tavsiya qilaman!" },
    ],
  },
  {
    id: 'm6',
    name: 'Davron Xolmatov',
    category: 'electrician',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    rating: 4.6,
    reviewsCount: 63,
    experience: '3 yil tajriba',
    price: 55000,
    distanceKm: 1.9,
    etaMin: 18,
    online: true,
    bio: 'Kichik va katta hajmdagi elektr ishlarini bajaraman, tezkor xizmat.',
    skills: ['Rozetka', "Lyustra o'rnatish", 'Simlarni almashtirish'],
    reviews: [
      { name: 'Gulnora P.', rating: 4, date: '6 kun oldin', text: 'Yaxshi, lekin biroz kutishga toʻgʻri keldi.' },
    ],
  },
];

// --- Buyurtmalar tarixi ----------------------------------------
const ORDER_HISTORY = [
  { id: 'o1001', masterId: 'm1', category: 'Santexnik', date: '14-iyul, 2026', price: 80000, status: 'completed' },
  { id: 'o1000', masterId: 'm3', category: 'Konditsioner', date: '2-iyul, 2026', price: 120000, status: 'completed' },
  { id: 'o0999', masterId: 'm2', category: 'Elektrik', date: '28-iyun, 2026', price: 70000, status: 'cancelled' },
  { id: 'o0998', masterId: 'm5', category: 'Duradgor', date: '19-iyun, 2026', price: 95000, status: 'completed' },
];

// --- Joriy foydalanuvchi (demo) ---------------------------------
const CURRENT_USER = {
  name: 'Aziz Rahimov',
  phone: '+998 90 123 45 67',
  photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop',
  ordersCount: 12,
  memberSince: '2024',
};

// --- Buyurtma sana / vaqt slotlari (namuna) ----------------------
function generateDateSlots() {
  const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
  const out = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      label: i === 0 ? 'Bugun' : days[d.getDay()],
      dnum: d.getDate(),
      iso: d.toISOString().slice(0, 10),
    });
  }
  return out;
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
