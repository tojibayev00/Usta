/**
 * ============================================================
 * Utils — catchAsync
 * ------------------------------------------------------------
 * Har bir async controller funksiyasida try/catch yozishning
 * o'rniga shu wrapper ishlatiladi. Xato bo'lsa avtomatik
 * next(err) chaqiriladi va markazlashtirilgan error-handler
 * uni ushlab oladi.
 *
 * Ishlatilishi:
 *   router.get('/masters', catchAsync(masterController.list));
 * ============================================================
 */

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
