/**
 * ============================================================
 * Controller — Master
 * ============================================================
 */

const masterService = require('../services/masterService');
const catchAsync = require('../utils/catchAsync');

const masterController = {
  list: catchAsync(async (req, res) => {
    const result = await masterService.list(req.query);
    res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
  }),

  getById: catchAsync(async (req, res) => {
    const master = await masterService.getById(req.params.id);
    res.status(200).json({ success: true, data: master });
  }),

  setOnlineStatus: catchAsync(async (req, res) => {
    const { isOnline } = req.body;
    const master = await masterService.setOnlineStatus(req.user.id, Boolean(isOnline));
    res.status(200).json({ success: true, data: master });
  }),

  registerSelf: catchAsync(async (req, res) => {
    const master = await masterService.registerSelf(req.user.id, req.body);
    res.status(201).json({ success: true, data: master });
  }),

  getMine: catchAsync(async (req, res) => {
    const master = await masterService.getMine(req.user.id);
    res.status(200).json({ success: true, data: master });
  }),
};

module.exports = masterController;
