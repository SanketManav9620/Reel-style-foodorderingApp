const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
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

// Compound index to prevent duplicate likes per user and foodId
likeSchema.index({ user: 1, foodId: 1 }, { unique: true });

const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);
module.exports = Like;
