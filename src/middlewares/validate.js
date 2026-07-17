/**
 * ============================================================
 * Middleware — validate
 * ------------------------------------------------------------
 * Zod sxemasini olib, req.body/query/params ni tekshiradi.
 * Xato bo'lsa, tushunarli xabar bilan 400 qaytaradi.
 *
 * Ishlatilishi:
 *   router.post('/orders', validate(createOrderSchema), ctrl.create)
 * ============================================================
 */

const AppError = require('../utils/AppError');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = `${firstIssue.path.join('.')}: ${firstIssue.message}`;
      return next(AppError.badRequest(message, 'VALIDATION_ERROR'));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
