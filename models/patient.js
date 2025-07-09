// This file defines the Patient model schema for a healthcare application.
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName:        { type: String, required: true },                 // Patient's first name
  lastName:         { type: String, required: true },                 // Patient's last name
  gender:           { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  isPregnant:       { type: Boolean, default: false },                // Only shown if gender==='Female'
  isBreastfeeding:  { type: Boolean, default: false },                // Only shown if gender==='Female'
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(dob) {
        const ageDiffMs = Date.now() - dob.getTime();
        const ageDate   = new Date(ageDiffMs);
        const age       = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age <= 120;                // Ensure age ≤ 120
      },
      message: 'Age must be 120 years or less'
    }
  },
  email:            { type: String, required: true, unique: true },   // Must be unique
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]+$/, 'Phone must contain only digits']
  },
  imageUrl:         { type: String },                                 // URL of patient’s face image
  chronicConditions: [
    { type: String }
  ],// e.g. ['Diabetes', 'Asthma']
  allergies: [
    { type: String, lowercase: true }
  ],
  // Link back to the User who owns this Patient record
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,               // We always want to know who created it
    index: true
  }
}, {
  timestamps: true                // Automatically add createdAt and updatedAt
});

// Virtual property to compute age from dateOfBirth
patientSchema.virtual('age').get(function() {
  const ageDiffMs = Date.now() - this.dateOfBirth.getTime();
  const ageDate   = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Ensure virtuals are included in JSON output
patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
