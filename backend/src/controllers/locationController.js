/**
 * ============================================================
 * Controller — Location (viloyat/tuman ma'lumotlari)
 * ============================================================
 */

const { UZBEKISTAN_REGIONS } = require('../data/uzbekistan');

const locationController = {
  /** Barcha viloyatlar va ularning tumanlari ro'yxati */
  listRegions(req, res) {
    res.status(200).json({
      success: true,
      data: UZBEKISTAN_REGIONS.map((r) => r.name),
    });
  },

  /** Bitta viloyatning tumanlari (?region=Toshkent%20shahri) */
  listDistricts(req, res) {
    const { region } = req.query;
    if (!region) {
      return res.status(200).json({ success: true, data: [] });
    }
    const found = UZBEKISTAN_REGIONS.find((r) => r.name === region);
    res.status(200).json({ success: true, data: found ? found.districts : [] });
  },
};

module.exports = locationController;
