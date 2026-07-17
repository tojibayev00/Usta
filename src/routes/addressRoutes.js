/**
 * ============================================================
 * Routes — /api/addresses
 * ============================================================
 */

const express = require('express');
const addressController = require('../controllers/addressController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createAddressSchema } = require('../validators/masterValidator');

const router = express.Router();

router.use(authenticate);

// GET /api/addresses — mening saqlangan manzillarim
router.get('/', addressController.list);

// POST /api/addresses — yangi manzil qo'shish
router.post('/', validate(createAddressSchema), addressController.create);

// DELETE /api/addresses/:id — manzilni o'chirish
router.delete('/:id', addressController.remove);

module.exports = router;
