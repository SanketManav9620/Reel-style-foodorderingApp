const express = require('express');
const router = express.Router();
const { getFoodpartner } = require('../controller/foodpartner.controller');

router.get('/getFoodpartner/:id', getFoodpartner);

module.exports = router;