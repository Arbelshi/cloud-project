const path    = require('path');
const fs      = require('fs');
const Patient = require('../models/patient');
const User    = require('../models/user');
const { hasFace } = require('../utils/faceDetection');

// listAll  → GET  /patients
exports.listAll = async (req, res) => {
  const patients = await Patient.find();
  res.render('patients/index', { patients });
};


// showNewForm → GET  /patients/new
exports.showNewForm = (req, res) => {
  res.render('patients/new', { errors: null, patient: {} });
};

// create → POST /patients
exports.create = async (req, res) => {
  if (req.file) {
    const filePath = path.join(__dirname, '..', 'public/uploads', req.file.filename);
    const valid    = await hasFace(filePath);
    if (!valid) {
      fs.unlinkSync(filePath);
      return res.status(400).render('patients/new', {
        errors: { image: { message: 'Please upload a photo that clearly shows a face.' } },
        patient: { ...req.body, chronicConditions: (req.body.chronicConditions||'').split(',').map(c=>c.trim()) }
      });
    }
  }

  const { firstName, lastName, gender, dateOfBirth, email, phone, chronicConditions } = req.body;
  const imageUrl  = req.file ? `/uploads/${req.file.filename}` : '';
  const conditions = chronicConditions
    ? chronicConditions.split(',').map(c => c.trim())
    : [];

  try {
    const patientUser = new User({ email, password: phone, role: 'Patient' });
    await patientUser.save();

    const patient = await Patient.create({
      user:             patientUser._id,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email,
      phone,
      imageUrl,
      isPregnant:      !!req.body.isPregnant,
      isBreastfeeding: !!req.body.isBreastfeeding,
      chronicConditions: conditions
    });

    patientUser.patient = patient._id;
    await patientUser.save();

    res.redirect('/patients');
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).render('patients/new', {
        errors: err.errors,
        patient: { ...req.body, chronicConditions: conditions }
      });
    }
    throw err;
  }
};

// show → GET  /patients/:id
exports.show = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).send('Not found');
  res.render('patients/show', { patient });
};

// showEditForm → GET  /patients/:id/edit
exports.showEditForm = async (req, res) => {
  let patient = await Patient.findById(req.params.id);
  if (!patient) patient = { _id: req.params.id };
  res.render('patients/edit', { errors: null, patient });
};

// update → PUT  /patients/:id
exports.update = async (req, res) => {
  const patientId = req.params.id;
  if (req.file) {
    const filePath = path.join(__dirname, '..', 'public/uploads', req.file.filename);
    const valid    = await hasFace(filePath);
    if (!valid) {
      fs.unlinkSync(filePath);
      return res.status(400).render('patients/edit', {
        errors: { image: { message: 'Please upload a photo that clearly shows a face.' } },
        patient: {
          _id: patientId,
          ...req.body,
          chronicConditions: (req.body.chronicConditions||'').split(',').map(c=>c.trim()),
          imageUrl: req.body.currentImageUrl
        }
      });
    }
  }

  const data = {
    firstName: req.body.firstName,
    lastName:  req.body.lastName,
    gender:    req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    phone:       req.body.phone,
    imageUrl:    req.file ? `/uploads/${req.file.filename}` : req.body.currentImageUrl,
    isPregnant:       !!req.body.isPregnant,
    isBreastfeeding:  !!req.body.isBreastfeeding,
    chronicConditions: req.body.chronicConditions
      ? req.body.chronicConditions.split(',').map(c => c.trim())
      : []
  };

  await Patient.findByIdAndUpdate(patientId, data, { new: true, runValidators: true });
  res.redirect(`/patients/${patientId}`);
};


// delete → DELETE /patients/:id
exports.delete = async (req, res) => {
  const patientId = req.params.id;
  await Patient.findByIdAndDelete(patientId);
  await User.updateOne({ patient: patientId }, { $unset: { patient: 1 } });
  res.redirect('/patients');
};
