const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  usedBy: { type: String, default: null },
});

module.exports = mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema);
