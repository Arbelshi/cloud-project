const express = require('express');
const router  = express.Router();

const patientController = require('../Controllers/patientController');
const { requireLogin, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Doctor-only: Patient list
router.get('/patients', requireLogin, requireRole('Doctor'),patientController.listAll
);

// Doctor-only: New Patient Creation Form
router.get('/patients/new', requireLogin, requireRole('Doctor'), patientController.showNewForm
);

// Doctor-only: Create a patient
router.post(
  '/patients',
  requireLogin,
  requireRole('Doctor'),
  upload.single('image'),         
  patientController.create
);

// Shared: Patient details view
router.get('/patients/:id', requireLogin, patientController.show
);

// Shared: Patient Edit Form
router.get('/patients/:id/edit', requireLogin, patientController.showEditForm
);

// Shared: Patient Update
router.put(
  '/patients/:id',
  requireLogin,
  upload.single('image'),       
  patientController.update
);

// Doctor-only: Deleting a patient
router.delete('/patients/:id', requireLogin, requireRole('Doctor'), patientController.delete
);

module.exports = router;
