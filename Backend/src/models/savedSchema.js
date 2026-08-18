const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    foodId: {
      type: String,
      required: true
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate saves per user and foodId
savedSchema.index({ user: 1, foodId: 1 }, { unique: true });

const SavedReel = mongoose.models.SavedReel || mongoose.model('SavedReel', savedSchema);
module.exports = SavedReel;
