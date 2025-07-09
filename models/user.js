const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Doctor','Patient'],
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  }
}, { timestamps: true });

// Virtual for setting plain password
userSchema.virtual('password')
  .set(function(pw) {
    this._password = pw;
    this.passwordHash = bcrypt.hashSync(pw, 10);
  });

// Method to check password
userSchema.methods.checkPassword = function(pw) {
  return bcrypt.compareSync(pw, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
