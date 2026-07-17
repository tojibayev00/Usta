/**
 * ============================================================
 * Utils — Telegram initData Validator
 * ------------------------------------------------------------
 * Telegram Web App ochilganda `window.Telegram.WebApp.initData`
 * degan qatorni beradi. Bu qatorda foydalanuvchi ma'lumotlari
 * va Telegram tomonidan hisoblangan `hash` bor.
 *
 * Backend shu hash'ni bot tokeni asosida qayta hisoblab,
 * so'rov haqiqatan Telegram'dan kelganini va o'zgartirilmaganini
 * tasdiqlaydi. Bu — Telegram Web App uchun RASMIY tavsiya
 * qilingan autentifikatsiya usuli (parol yoki SMS shart emas).
 *
 * Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 * ============================================================
 */

const crypto = require('crypto');

/**
 * initData qatorini tekshiradi va, agar haqiqiy bo'lsa,
 * undagi foydalanuvchi obyektini qaytaradi.
 *
 * @param {string} initData - Telegram.WebApp.initData qatori
 * @param {string} botToken - @BotFather bergan bot tokeni
 * @param {number} [maxAgeSeconds=86400] - initData necha soniyagacha yaroqli (default: 24 soat)
 * @returns {{ ok: true, user: object } | { ok: false, reason: string }}
 */
function validateTelegramInitData(initData, botToken, maxAgeSeconds = 86400) {
  if (!initData || typeof initData !== 'string') {
    return { ok: false, reason: 'initData bo\'sh yoki noto\'g\'ri formatda' };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { ok: false, reason: 'hash maydoni topilmadi' };
  }
  params.delete('hash');

  // Qolgan maydonlarni alifbo tartibida "key=value" ko'rinishida birlashtiramiz
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Telegram hujjatiga ko'ra: secret_key = HMAC_SHA256("WebAppData", bot_token)
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // Doimiy-vaqtli solishtirish (timing attack'ning oldini olish uchun)
  const hashesMatch = safeCompare(computedHash, hash);
  if (!hashesMatch) {
    return { ok: false, reason: 'Hash mos kelmadi — ma\'lumot ishonchli emas' };
  }

  // Muddati o'tganligini tekshirish
  const authDate = parseInt(params.get('auth_date'), 10);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSeconds) {
    return { ok: false, reason: 'initData muddati o\'tgan, qayta login qiling' };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { ok: false, reason: 'user maydoni topilmadi' };
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return { ok: false, reason: 'user maydonini o\'qib bo\'lmadi' };
  }

  return { ok: true, user };
}

function safeCompare(a, b) {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { validateTelegramInitData };
