const mongoose = require('mongoose');
const ruleSchema = new mongoose.Schema({
  condition:  { type: String, required: true, unique: true },
  nutrient:   { type: String, required: true },
  operator:   { type: String, enum: ['>','<'], default: '>' },
  threshold:  { type: Number, required: true }
});
module.exports = mongoose.model('ConditionRule', ruleSchema);
