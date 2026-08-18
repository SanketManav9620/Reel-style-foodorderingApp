const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    videoUrl: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    category: { type: String, default: 'General' },
    foodPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    likesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);
module.exports = Food;