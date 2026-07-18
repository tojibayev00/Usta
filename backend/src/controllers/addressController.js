/**
 * ============================================================
 * Controller — Address
 * ============================================================
 */

const addressService = require('../services/addressService');
const catchAsync = require('../utils/catchAsync');

const addressController = {
  list: catchAsync(async (req, res) => {
    const addresses = await addressService.listForUser(req.user.id);
    res.status(200).json({ success: true, data: addresses });
  }),

  create: catchAsync(async (req, res) => {
    const address = await addressService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: address });
  }),

  remove: catchAsync(async (req, res) => {
    await addressService.remove(req.user.id, req.params.id);
    res.status(204).send();
  }),
};

module.exports = addressController;
