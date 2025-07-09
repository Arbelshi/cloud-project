const path = require('path');
const Patient   = require('../models/patient');
const Detection = require('../models/detection');
const { detectFood }    = require('../utils/foodDetection');
const { searchFood, getFoodDetails } = require('../utils/usda');
const { getWarningsForProfile } = require('../utils/conditionWarnings');

exports.showUploadForm = (req, res) => {
  res.render('food/upload', { error: null });
};

exports.handleUpload = async (req, res) => {
  if (!req.file) {
    return res.render('food/upload', {
      error: 'Please select an image for analysis.'
    });
  }

  const filePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);

    try {
    // Retrieving the patient profile
    const patientProfile = await Patient.findById(req.session.userData.patient);

    // Identifying concepts in a picture
    const concepts = await detectFood(filePath);
    if (concepts.length === 0) {
      return res.render('food/upload', {
        error: 'No food items detected in the image. Please try a different image.'
      });
    }

    // For each concept – USDA search, extract details, build warnings
    const results = [];
    for (let { name, confidence } of concepts) {
      const food = await searchFood(name);
      if (!food) continue;

      const full = await getFoodDetails(food.fdcId);
      const nutrients = {};
      full.foodNutrients.forEach(n => {
        const nutrName = n.nutrientName || (n.nutrient && n.nutrient.name);
        const nutrVal  = n.value ?? n.amount;
        if (nutrName && nutrVal != null) nutrients[nutrName] = nutrVal;
      });

      const warnings = getWarningsForProfile(
        patientProfile.chronicConditions,
        nutrients,
        name
      );

      results.push({
        name,
        confidence,
        description: food.description,
        nutrients,
        warnings
      });
    }

    // Saving in the database
    await Detection.create({
      patient:  req.session.userData.patient,
      imageUrl: `/uploads/${req.file.filename}`,
      items:    results
    });

    // Show result
    res.render('food/result', { items: results });

  } catch (err) {
    console.error('Food detection error:', err);
    res.render('food/upload', {
      error: 'An error occurred during food detection. Please try again later.'
    });
  }
};

exports.showHistory = async (req, res) => {
  // The doctor or owner can expect
  const patient = await Patient.findById(req.params.id);
  const detections = await Detection.find({ patient: req.params.id })
    .sort({ createdAt: -1 });

  res.render('patients/food-history', {
    patientName: `${patient.firstName} ${patient.lastName}`,
    detections
  });
};
