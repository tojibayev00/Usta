# ============================================================
# UstaTop Backend — Dockerfile
# ============================================================

FROM node:20-alpine

# Prisma'ning binary engine'lari ishlashi uchun Alpine'ga OpenSSL
# va kerakli kutubxonalarni o'rnatamiz. Buni qilmasak, Prisma
# "libssl aniqlanmadi" ogohlantirishi bilan noto'g'ri engine
# yuklaydi va "Could not parse schema engine response" xatosi
# beradi (JSON o'rniga engine binary xato format qaytaradi).
RUN apk add --no-cache openssl libssl3 ca-certificates

WORKDIR /usr/src/app

# Bog'liqliklarni avval nusxalab o'rnatamiz — Docker layer cache
# tufayli kod o'zgarganda ham node_modules qayta yuklanmaydi
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Prisma Client'ni generatsiya qilish (schema.prisma asosida)
RUN npx prisma generate

# Qolgan kodni nusxalash
COPY . .

EXPOSE 4000

# Konteyner ishga tushganda: migratsiyalarni qo'llash, keyin serverni ko'tarish
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node prisma/seed.js && node src/server.js"]
