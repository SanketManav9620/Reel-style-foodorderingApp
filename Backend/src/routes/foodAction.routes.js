const express = require('express');
const router = express.Router();
const {
  toggleLike,
  toggleSave,
  getLikedFoods,
  getSavedFoods,
  getUserInteractions
} = require('../controller/foodAction.controller');

router.post('/:id/like', toggleLike);
router.post('/:id/save', toggleSave);
router.get('/user/liked', getLikedFoods);
router.get('/user/saved', getSavedFoods);
router.get('/user/interactions', getUserInteractions);

module.exports = router;
