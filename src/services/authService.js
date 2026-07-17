/**
 * ============================================================
 * Service — Auth
 * ------------------------------------------------------------
 * Telegram Web App orqali kelgan initData'ni tekshiradi,
 * foydalanuvchini topadi yoki yaratadi, va JWT qaytaradi.
 * ============================================================
 */

const userRepository = require('../repositories/userRepository');
const { validateTelegramInitData } = require('../utils/telegramAuth');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const authService = {
  /**
   * @param {string} initData - frontend'dan kelgan Telegram.WebApp.initData
   * @returns {Promise<{ token: string, user: object }>}
   */
  async loginWithTelegram(initData) {
    const result = validateTelegramInitData(initData, config.telegram.botToken);

    if (!result.ok) {
      throw AppError.unauthorized(
        `Telegram autentifikatsiyasi muvaffaqiyatsiz: ${result.reason}`,
        'TELEGRAM_AUTH_FAILED'
      );
    }

    const tgUser = result.user;

    let user = await userRepository.findByTelegramId(tgUser.id);

    if (!user) {
      user = await userRepository.create({
        telegramId: BigInt(tgUser.id),
        firstName: tgUser.first_name || 'Foydalanuvchi',
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        photoUrl: tgUser.photo_url || null,
      });
    } else {
      // Har login paytida Telegram profilidagi so'nggi ma'lumotlar bilan sinxronlashtiramiz
      user = await userRepository.update(user.id, {
        firstName: tgUser.first_name || user.firstName,
        lastName: tgUser.last_name ?? user.lastName,
        username: tgUser.username ?? user.username,
        photoUrl: tgUser.photo_url ?? user.photoUrl,
      });
    }

    const token = signToken({ sub: user.id, role: user.role });

    return { token, user: serializeUser(user) };
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('Foydalanuvchi topilmadi');
    return serializeUser(user);
  },
};

/** BigInt kabi JSON'da to'g'ridan-to'g'ri serialize bo'lmaydigan maydonlarni tozalaydi */
function serializeUser(user) {
  return {
    id: user.id,
    telegramId: user.telegramId.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = { authService, serializeUser };
