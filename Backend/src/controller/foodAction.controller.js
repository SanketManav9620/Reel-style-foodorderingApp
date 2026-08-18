const Like = require('../models/likeSchema');
const SavedReel = require('../models/savedSchema');
const Food = require('../models/foodSchema');
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');

// Helper to get or fallback userId from request
async function getUserIdFromReq(req) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
      if (decoded && decoded.id) {
        return decoded.id;
      }
    }
  } catch (err) {
    // ignore token error
  }

  if (req.body?.userId && req.body.userId.length === 24) {
    return req.body.userId;
  }
  if (req.headers['x-user-id'] && req.headers['x-user-id'].length === 24) {
    return req.headers['x-user-id'];
  }

  // Fallback demo user for browsing users
  let defaultUser = await User.findOne({ username: 'demouser' });
  if (!defaultUser) {
    defaultUser = await User.create({
      username: 'demouser',
      email: 'demo@foodreel.com',
      password: 'demopassword123'
    });
  }
  return defaultUser._id;
}

// 1. Toggle Like for a Food Reel
async function toggleLike(req, res) {
  try {
    const rawFoodId = req.params.id;
    const userId = await getUserIdFromReq(req);

    if (!rawFoodId) {
      return res.status(400).json({ message: 'Food ID is required' });
    }

    const foodIdStr = rawFoodId.toString();

    // Check if food exists in DB as ObjectId
    let foodObjId = null;
    let foodDoc = null;
    if (foodIdStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(foodIdStr)) {
      foodObjId = foodIdStr;
      foodDoc = await Food.findById(foodIdStr);
    } else {
      foodDoc = await Food.findOne({ $or: [{ _id: foodIdStr }, { name: { $regex: foodIdStr, $options: 'i' } }] });
      if (foodDoc) foodObjId = foodDoc._id;
    }

    const existingLike = await Like.findOne({ user: userId, foodId: foodIdStr });

    let liked = false;
    if (existingLike) {
      // Unlike: remove record
      await Like.findByIdAndDelete(existingLike._id);
      if (foodDoc) {
        await Food.findByIdAndUpdate(foodDoc._id, { $inc: { likesCount: -1 } });
      }
      liked = false;
    } else {
      // Like: create record with timestamp
      await Like.create({
        user: userId,
        foodId: foodIdStr,
        ...(foodObjId ? { food: foodObjId } : {})
      });
      if (foodDoc) {
        await Food.findByIdAndUpdate(foodDoc._id, { $inc: { likesCount: 1 } });
      }
      liked = true;
    }

    let updatedLikesCount = 0;
    if (foodDoc) {
      const refreshedFood = await Food.findById(foodDoc._id);
      updatedLikesCount = Math.max(0, refreshedFood ? refreshedFood.likesCount : 0);
    } else {
      const totalLikesForFood = await Like.countDocuments({ foodId: foodIdStr });
      updatedLikesCount = totalLikesForFood;
    }

    return res.status(200).json({
      message: liked ? 'Food reel liked successfully' : 'Food reel unliked',
      liked,
      likesCount: updatedLikesCount,
      foodId: foodIdStr
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({ message: 'Error toggling like: ' + error.message });
  }
}

// 2. Toggle Save Later for a Food Reel
async function toggleSave(req, res) {
  try {
    const rawFoodId = req.params.id;
    const userId = await getUserIdFromReq(req);

    if (!rawFoodId) {
      return res.status(400).json({ message: 'Food ID is required' });
    }

    const foodIdStr = rawFoodId.toString();

    let foodObjId = null;
    let foodDoc = null;
    if (foodIdStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(foodIdStr)) {
      foodObjId = foodIdStr;
      foodDoc = await Food.findById(foodIdStr);
    } else {
      foodDoc = await Food.findOne({ $or: [{ _id: foodIdStr }, { name: { $regex: foodIdStr, $options: 'i' } }] });
      if (foodDoc) foodObjId = foodDoc._id;
    }

    const existingSave = await SavedReel.findOne({ user: userId, foodId: foodIdStr });

    let saved = false;
    if (existingSave) {
      // Unsave: remove record
      await SavedReel.findByIdAndDelete(existingSave._id);
      if (foodDoc) {
        await Food.findByIdAndUpdate(foodDoc._id, { $inc: { savesCount: -1 } });
      }
      saved = false;
    } else {
      // Save: create record with timestamp
      await SavedReel.create({
        user: userId,
        foodId: foodIdStr,
        ...(foodObjId ? { food: foodObjId } : {})
      });
      if (foodDoc) {
        await Food.findByIdAndUpdate(foodDoc._id, { $inc: { savesCount: 1 } });
      }
      saved = true;
    }

    return res.status(200).json({
      message: saved ? 'Reel saved for later' : 'Reel removed from saved',
      saved,
      foodId: foodIdStr
    });
  } catch (error) {
    console.error('Toggle save error:', error);
    return res.status(500).json({ message: 'Error toggling save: ' + error.message });
  }
}

// 3. Get all Liked Food Reels for User with timestamps
async function getLikedFoods(req, res) {
  try {
    const userId = await getUserIdFromReq(req);
    const likes = await Like.find({ user: userId })
      .populate({
        path: 'food',
        populate: { path: 'foodPartner', select: 'name address city cuisineType ownerName' }
      })
      .sort({ createdAt: -1 });

    const allFoods = await Food.find().populate('foodPartner');

    const likedItems = likes.map(item => {
      let foodObj = item.food;
      if (!foodObj) {
        foodObj = allFoods.find(f => f._id.toString() === item.foodId || f.name.toLowerCase().includes(item.foodId.toLowerCase()));
      }
      return {
        _id: item.foodId,
        foodId: item.foodId,
        food: foodObj || {
          _id: item.foodId,
          name: 'Liked Food Reel',
          description: 'Saved in user favorites',
          price: 299,
          videoUrl: '/videos/video1.mp4'
        },
        likedAt: item.createdAt,
        timestamp: item.createdAt
      };
    });

    return res.status(200).json({
      total: likedItems.length,
      likedItems
    });
  } catch (error) {
    console.error('Get liked foods error:', error);
    return res.status(500).json({ message: 'Error fetching liked foods: ' + error.message });
  }
}

// 4. Get all Saved Food Reels for User with timestamps
async function getSavedFoods(req, res) {
  try {
    const userId = await getUserIdFromReq(req);
    const saved = await SavedReel.find({ user: userId })
      .populate({
        path: 'food',
        populate: { path: 'foodPartner', select: 'name address city cuisineType ownerName' }
      })
      .sort({ createdAt: -1 });

    const allFoods = await Food.find().populate('foodPartner');

    const savedItems = saved.map(item => {
      let foodObj = item.food;
      if (!foodObj) {
        foodObj = allFoods.find(f => f._id.toString() === item.foodId || f.name.toLowerCase().includes(item.foodId.toLowerCase()));
      }
      return {
        _id: item.foodId,
        foodId: item.foodId,
        food: foodObj || {
          _id: item.foodId,
          name: 'Saved Food Reel',
          description: 'Saved for later',
          price: 299,
          videoUrl: '/videos/video1.mp4'
        },
        savedAt: item.createdAt,
        timestamp: item.createdAt
      };
    });

    return res.status(200).json({
      total: savedItems.length,
      savedItems
    });
  } catch (error) {
    console.error('Get saved foods error:', error);
    return res.status(500).json({ message: 'Error fetching saved foods: ' + error.message });
  }
}

// 5. Get user interaction status map (liked and saved food IDs)
async function getUserInteractions(req, res) {
  try {
    const userId = await getUserIdFromReq(req);
    const likes = await Like.find({ user: userId }).select('foodId createdAt');
    const saved = await SavedReel.find({ user: userId }).select('foodId createdAt');

    const likedMap = {};
    likes.forEach(l => {
      if (l.foodId) likedMap[l.foodId] = { likedAt: l.createdAt };
    });

    const savedMap = {};
    saved.forEach(s => {
      if (s.foodId) savedMap[s.foodId] = { savedAt: s.createdAt };
    });

    return res.status(200).json({
      likedMap,
      savedMap
    });
  } catch (error) {
    console.error('Get user interactions error:', error);
    return res.status(500).json({ message: 'Error fetching interactions: ' + error.message });
  }
}

module.exports = {
  toggleLike,
  toggleSave,
  getLikedFoods,
  getSavedFoods,
  getUserInteractions
};
