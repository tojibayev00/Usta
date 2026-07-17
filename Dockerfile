# ============================================================
# UstaTop Backend — Dockerfile
# ============================================================

FROM node:20-alpine

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
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
