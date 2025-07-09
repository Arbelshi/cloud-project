const express = require('express');
const router  = express.Router();

const foodController = require('../Controllers/foodController');
const { requireLogin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Food Discovery Image Upload Form
router.get('/food-detect', requireLogin, foodController.showUploadForm);

// Sending the image and analyzing it
router.post(
  '/food-detect',
  requireLogin,
  upload.single('foodImage'),
  foodController.handleUpload
);


// Viewing a patient's scan history
router.get('/patients/:id/food-history', requireLogin, foodController.showHistory);

module.exports = router;
