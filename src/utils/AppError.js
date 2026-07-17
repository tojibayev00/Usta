/**
 * ============================================================
 * Utils — AppError
 * ------------------------------------------------------------
 * Barcha nazorat qilinadigan (kutilgan) xatolar shu klass
 * orqali tashlanadi. Markazlashtirilgan error-handler
 * middleware buni to'g'ri HTTP status va JSON formatga
 * o'giradi. Kutilmagan (dasturiy) xatolar oddiy Error
 * bo'lib qoladi va 500 sifatida qaytariladi.
 * ============================================================
 */

class AppError extends Error {
  /**
   * @param {string} message - foydalanuvchiga ko'rsatiladigan xabar
   * @param {number} statusCode - HTTP status kodi
   * @param {string} [code] - mashina o'qiy oladigan xato kodi (frontend uchun)
   */
  constructor(message, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = 'Avtorizatsiyadan o\'tilmagan', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  static forbidden(message = 'Ruxsat berilmagan', code = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  static notFound(message = 'Topilmadi', code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  static internal(message = 'Ichki server xatosi', code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code);
  }
}

module.exports = AppError;
