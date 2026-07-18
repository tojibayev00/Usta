/**
 * ============================================================
 * Service — Address
 * ============================================================
 */

const addressRepository = require('../repositories/addressRepository');
const AppError = require('../utils/AppError');

const addressService = {
  async listForUser(userId) {
    return addressRepository.findByUser(userId);
  },

  async create(userId, data) {
    const address = await addressRepository.create({ ...data, userId });
    if (data.isDefault) {
      await addressRepository.setAsDefault(userId, address.id);
    }
    return address;
  },

  async remove(userId, addressId) {
    const address = await addressRepository.findById(addressId);
    if (!address) throw AppError.notFound('Manzil topilmadi');
    if (address.userId !== userId) throw AppError.forbidden('Bu manzilni o\'chira olmaysiz');
    await addressRepository.delete(addressId);
  },
};

module.exports = addressService;
