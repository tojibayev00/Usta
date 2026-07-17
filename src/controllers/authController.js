/**
 * ============================================================
 * Controller — Auth
 * ============================================================
 */

const { authService } = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

const authController = {
  loginWithTelegram: catchAsync(async (req, res) => {
    const { initData } = req.body;
    const { token, user } = await authService.loginWithTelegram(initData);
    res.status(200).json({ success: true, data: { token, user } });
  }),

  getMe: catchAsync(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: user });
  }),
};

module.exports = authController;
