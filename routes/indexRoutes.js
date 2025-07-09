const express = require('express');
const router  = express.Router();
const { requireLogin } = require('../middleware/auth');
const homeController   = require('../Controllers/homeController');

router.get('/', requireLogin, homeController.dashboard);

module.exports = router;
