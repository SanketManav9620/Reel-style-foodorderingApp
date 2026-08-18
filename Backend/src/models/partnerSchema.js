const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    cuisineType: { type: String, required: true },
    licenseNumber: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

const Partner = mongoose.models.Partner || mongoose.model('Partner', partnerSchema);
module.exports = Partner;