/**
 * ============================================================
 * Middleware — errorHandler
 * ------------------------------------------------------------
 * Express zanjiridagi so'nggi middleware. Barcha next(err)
 * chaqiruvlari shu yerga keladi va bir xil JSON formatda
 * javob qaytariladi:
 *   { success: false, message, code }
 * ============================================================
 */

const config = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isOperational = err.isOperational === true;
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = isOperational ? err.message : 'Kutilmagan server xatosi yuz berdi';

  if (!isOperational) {
    // Dasturiy (kutilmagan) xatolarni to'liq log qilamiz
    // eslint-disable-next-line no-console
    console.error('[UNEXPECTED ERROR]', err);
  }

  const body = { success: false, message, code };
  if (config.env === 'development' && !isOperational) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Yo'l topilmadi: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
}

module.exports = { errorHandler, notFoundHandler };
