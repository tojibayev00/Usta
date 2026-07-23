# UstaTop — Backend API

Telegram Web App orqali mahalliy ustalarni topish va buyurtma berish tizimi uchun REST API.

## Texnologiyalar

- **Node.js + Express** — HTTP server
- **PostgreSQL + Prisma ORM** — ma'lumotlar bazasi
- **JWT** — sessiya boshqaruvi
- **Telegram Web App `initData`** — yagona autentifikatsiya usuli (parol/SMS yo'q)
- **Zod** — request validatsiyasi
- **Docker Compose** — bir buyruqda Postgres + API

## Arxitektura (Clean Architecture)

```
src/
├── config/         # env, Prisma client
├── routes/         # URL -> controller bog'lash
├── controllers/     # HTTP request/response, service chaqirish
├── services/         # Biznes-logika (state machine, hisob-kitoblar)
├── repositories/     # Faqat Prisma so'rovlari
├── middlewares/       # auth, validate, errorHandler
├── validators/        # Zod sxemalari
└── utils/             # AppError, JWT, Telegram HMAC tekshiruvi
```

Qatlamlar bir yo'nalishda bog'liq: `route → controller → service → repository`.
Repository hech qachon boshqa repository yoki service'ni chaqirmaydi — bu qatlamlarni
mustaqil test qilish va kelajakda almashtirishni osonlashtiradi.

## Tezkor ishga tushirish (Docker)

```bash
cp .env.example .env
# .env faylida TELEGRAM_BOT_TOKEN qiymatini @BotFather'dan olingan haqiqiy token bilan almashtiring

docker compose up --build
```

Birinchi marta ko'tarilganda migratsiyalar avtomatik qo'llanadi. Namunaviy
ma'lumotlarni (8 kategoriya + 5 usta) yuklash uchun:

```bash
docker compose exec api npm run prisma:seed
```

API manzili: `http://localhost:4000`
Health check: `http://localhost:4000/health`

## Docker'siz ishga tushirish

```bash
npm install
cp .env.example .env   # DATABASE_URL'ni mahalliy Postgres'ga moslang

npx prisma migrate dev --name init
npm run prisma:seed

npm run dev             # nodemon bilan, http://localhost:4000
```

## Autentifikatsiya qanday ishlaydi

1. Telegram Web App ochilganda frontend `window.Telegram.WebApp.initData` qatorini oladi.
2. Frontend shu qatorni `POST /api/auth/telegram` ga yuboradi.
3. Backend HMAC-SHA256 orqali `initData`'ni bot tokeni bilan tekshiradi
   (`src/utils/telegramAuth.js`) — bu Telegram'ning rasmiy tavsiyasi.
4. Tekshiruv o'tsa, backend foydalanuvchini topadi/yaratadi va JWT qaytaradi.
5. Frontend keyingi barcha so'rovlarda `Authorization: Bearer <token>` yuboradi.

SMS OTP yoki parol ishlatilmaydi — Telegram Web App ichida bu shart emas,
chunki foydalanuvchi allaqachon Telegram orqali autentifikatsiya qilingan.

## Buyurtma holatlar mashinasi (State Machine)

```
PENDING → ACCEPTED → ON_WAY → ARRIVED → IN_PROGRESS → COMPLETED
   ↓          ↓          ↓         ↓            ↓
                    CANCELLED (istalgan bosqichdan)
```

- Statusni faqat **usta** oldinga suradi (`PATCH /api/orders/:id/status`).
- **Mijoz** faqat `CANCELLED` ga o'tkaza oladi.
- Ruxsat etilmagan o'tish (masalan `PENDING` dan to'g'ridan-to'g'ri `COMPLETED` ga)
  `400 INVALID_STATUS_TRANSITION` xatosi bilan rad etiladi.
- Har bir status o'zgarishi `OrderStatusEvent` jadvaliga yoziladi — frontenddagi
  "Live status" sahifasi shu tarixni ko'rsatadi.

## API endpointlari

| Method | Endpoint | Auth | Tavsif |
|---|---|---|---|
| POST | `/api/auth/telegram` | — | Telegram orqali login/registratsiya |
| GET | `/api/auth/me` | ✅ | Joriy foydalanuvchi |
| GET | `/api/categories` | — | Xizmat kategoriyalari |
| GET | `/api/masters` | — | Ustalar ro'yxati (filtr/saralash) |
| GET | `/api/masters/:id` | — | Usta profili + sharhlar |
| POST | `/api/masters/register` | ✅ | Mijoz o'zini usta sifatida ro'yxatdan o'tkazadi |
| GET | `/api/masters/mine` | ✅ (MASTER) | Ustaning o'z profili |
| PATCH | `/api/masters/me/online` | ✅ (MASTER) | Online holatni almashtirish |
| GET | `/api/locations/regions` | — | O'zbekiston viloyatlari ro'yxati |
| GET | `/api/locations/districts?region=...` | — | Tanlangan viloyat tumanlari |
| POST | `/api/orders` | ✅ | Yangi buyurtma yaratish |
| GET | `/api/orders/mine` | ✅ | Mening buyurtmalarim (mijoz) |
| GET | `/api/orders/master/mine` | ✅ (MASTER) | Qabul qilingan buyurtmalar |
| GET | `/api/orders/:id` | ✅ | Buyurtma tafsilotlari (live status) |
| PATCH | `/api/orders/:id/status` | ✅ | Status o'zgartirish |
| POST | `/api/orders/:orderId/review` | ✅ | Sharh qoldirish |
| GET | `/api/addresses` | ✅ | Saqlangan manzillar |
| POST | `/api/addresses` | ✅ | Manzil qo'shish |
| DELETE | `/api/addresses/:id` | ✅ | Manzil o'chirish |

### `GET /api/masters` filtrlari

- `categoryId` yoki `categorySlug` — kategoriya bo'yicha
- `sort` — `rating` \| `distance` \| `price_asc` \| `price_desc`
- `onlineOnly=true` — faqat onlayn ustalar
- `region`, `district`, `village` — manzil bo'yicha (qisman moslik, katta-kichik harf farqi yo'q)
- `lat`, `lng` — `sort=distance` uchun majburiy (Haversine formula bilan hisoblanadi)
- `page`, `pageSize` — sahifalash

### Namuna: Telegram orqali login

```bash
curl -X POST http://localhost:4000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "query_id=...&user=%7B...%7D&auth_date=...&hash=..."}'
```

Javob:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "firstName": "Aziz", "role": "CUSTOMER" }
  }
}
```

### Namuna: Buyurtma yaratish

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "masterId": "uuid-of-master",
    "scheduledAt": "2026-07-20T10:00:00.000Z",
    "note": "Vannadagi kran oqmoqda",
    "address": { "fullText": "Chilonzor tumani, 12-uy" }
  }'
```

## Xato formati

Barcha xatolar bir xil JSON formatda qaytadi:

```json
{ "success": false, "message": "Tushunarli xabar", "code": "MACHINE_READABLE_CODE" }
```

## Admin bot — ustalarni Telegram orqali boshqarish

Alohida admin panel (veb-sahifa) o'rniga, ustalarni boshqarish uchun **shu bot orqali maxsus buyruqlar** qo'shilgan. Bu buyruqlar faqat `ADMIN_TELEGRAM_ID` da ko'rsatilgan Telegram ID'dan kelgan xabarlarga javob beradi — boshqa foydalanuvchilar bu buyruqlarni ko'rmaydi ham, ishlata olmaydi ham.

### Sozlash

1. O'z Telegram ID raqamingizni bilib oling — @userinfobot ga yozing, u sizga ID raqamingizni beradi.
2. Railway'da (yoki `.env`da) `ADMIN_TELEGRAM_ID` o'zgaruvchisiga shu raqamni qo'ying.
3. Backend qayta deploy bo'lgach, botga `/start` deb yozing — agar sizning ID to'g'ri bo'lsa, admin buyruqlar ro'yxati chiqadi.

### Buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `/addmaster` | Yangi usta qo'shish — bot sizdan ketma-ket kategoriya, ism, narx, viloyat, tuman va h.k. so'raydi |
| `/listmasters` | Barcha ustalar ro'yxati (qisqartirilgan ID bilan) |
| `/editmaster <id>` | Mavjud ustaning bitta maydonini (ism, narx, viloyat, tuman, bio va h.k.) tahrirlash |
| `/deletemaster <id>` | Ustani o'chirish (ID `/listmasters` dan olinadi) |
| `/toggleonline <id>` | Ustaning onlayn/offlayn holatini almashtirish |
| `/verify <id>` | Ustani "tasdiqlangan" deb belgilash |
| `/cancel` | Joriy jarayonni bekor qilish |

### Muhim eslatma

Admin bot va Web App **bir xil bot tokenidan** foydalanadi — alohida bot yaratish shart emas. Bot ikkala vazifani ham bajaradi: oddiy foydalanuvchilarga Web App tugmasini ko'rsatadi, sizdan kelgan buyruqlarni esa admin sifatida qayta ishlaydi.

Bot polling rejimida ishlaydi (webhook emas) — bu Railway kabi doimiy ishlaydigan (serverless bo'lmagan) muhitlarda muammosiz ishlaydi.

## Prisma foydali buyruqlar

```bash
npm run prisma:studio     # ma'lumotlar bazasini vizual ko'rish (GUI)
npm run prisma:migrate    # yangi migratsiya yaratish (dev)
npm run prisma:deploy     # migratsiyalarni production'da qo'llash
```

## Keyingi qadamlar (production uchun tavsiyalar)

- `JWT_SECRET`'ni kuchli tasodifiy qiymatga almashtiring.
- Redis orqali OTP/keshlashni qo'shish (agar SMS auth ham kerak bo'lsa).
- WebSocket yoki Server-Sent Events qo'shib, "Live status" sahifasini
  polling o'rniga real-vaqtli qilish mumkin.
- To'lov integratsiyasi (Click, Payme) — hozircha `totalPrice` faqat hisoblanadi,
  to'lov holati saqlanmaydi.
