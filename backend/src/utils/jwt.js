/**
 * ============================================================
 * Utils — JWT helper
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Foydalanuvchi uchun JWT access token yaratadi.
 * @param {{ id: string, role: string }} payload
 */
function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/**
 * Tokenni tekshiradi va dekodlangan payloadni qaytaradi.
 * Xato bo'lsa jwt kutubxonasining o'zi Error tashlaydi —
 * buni chaqiruvchi joyda catch qilish kerak.
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { signToken, verifyToken };
