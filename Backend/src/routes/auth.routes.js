const express = require('express');
const router = express.Router();
const authcontroller = require('../controller/auth.controller');

router.post('/user/register', authcontroller.registerUser);
router.post('/user/login', authcontroller.loginUser);
router.get('/user/logout', authcontroller.logoutUser);

router.post('/partner/register', authcontroller.registerPartner);
router.post('/partner/login', authcontroller.loginPartner);
router.get('/partner/logout', authcontroller.logoutPartner);

module.exports = router;