/**
 * ============================================================
 * Controller — Order
 * ============================================================
 */

const { orderService } = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');

const orderController = {
  create: catchAsync(async (req, res) => {
    const order = await orderService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: order });
  }),

  getById: catchAsync(async (req, res) => {
    const order = await orderService.getById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: order });
  }),

  listMine: catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const orders = await orderService.listForCustomer(req.user.id, { page, pageSize });
    res.status(200).json({ success: true, data: orders });
  }),

  listForMyMasterAccount: catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const orders = await orderService.listForMaster(req.user.id, {
      page,
      pageSize,
      status: req.query.status,
    });
    res.status(200).json({ success: true, data: orders });
  }),

  updateStatus: catchAsync(async (req, res) => {
    const { status, note } = req.body;
    const order = await orderService.updateStatus(req.params.id, req.user.id, status, note);
    res.status(200).json({ success: true, data: order });
  }),
};

module.exports = orderController;
