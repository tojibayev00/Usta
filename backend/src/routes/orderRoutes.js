/**
 * ============================================================
 * Routes — /api/orders
 * ============================================================
 */

const express = require('express');
const orderController = require('../controllers/orderController');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createOrderSchema,
  updateOrderStatusSchema,
  createReviewSchema,
} = require('../validators/orderValidator');

const router = express.Router();

// Bu bo'limdagi barcha yo'llar autentifikatsiya talab qiladi
router.use(authenticate);

// POST /api/orders — yangi buyurtma yaratish
router.post('/', validate(createOrderSchema), orderController.create);

// GET /api/orders/mine — mening (mijoz sifatida) buyurtmalarim tarixi
router.get('/mine', orderController.listMine);

// GET /api/orders/master/mine — mening (usta sifatida) qabul qilgan buyurtmalarim
router.get('/master/mine', orderController.listForMyMasterAccount);

// GET /api/orders/:id — bitta buyurtma (live status uchun)
router.get('/:id', orderController.getById);

// PATCH /api/orders/:id/status — statusni o'zgartirish (usta yoki bekor qiluvchi mijoz)
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateStatus);

// POST /api/orders/:orderId/review — yakunlangan buyurtmaga sharh qoldirish
router.post('/:orderId/review', validate(createReviewSchema), reviewController.createForOrder);

module.exports = router;
