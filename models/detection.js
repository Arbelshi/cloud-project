const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for each detected item in the image
const itemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  nutrients: {
    type: Schema.Types.Mixed,
    default: {}
  },
  warning: {
    type: String,
    default: null
  },
  warnings: {
    type: [String],
    default: []
  }
});

// Main Detection schema
const detectionSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  items: {
    type: [itemSchema],
    default: []
  }
}, {
  timestamps: true  // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Detection', detectionSchema);
