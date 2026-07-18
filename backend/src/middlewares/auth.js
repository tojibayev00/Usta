/**
 * ============================================================
 * Middleware — authenticate
 * ------------------------------------------------------------
 * Authorization: Bearer <token> headerini o'qib, JWT'ni
 * tekshiradi va req.user ga foydalanuvchi ma'lumotini yozadi.
 * ============================================================
 */

const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const prisma = require('../config/prisma');

const authenticate = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw AppError.unauthorized('Token topilmadi. Iltimos, tizimga kiring.');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw AppError.unauthorized('Token yaroqsiz yoki muddati o\'tgan.', 'INVALID_TOKEN');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw AppError.unauthorized('Foydalanuvchi topilmadi.', 'USER_NOT_FOUND');
  }

  req.user = user;
  next();
});

/** Faqat berilgan rollarga ruxsat berish uchun (masalan faqat MASTER) */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AppError.forbidden('Bu amal uchun ruxsatingiz yo\'q.'));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
