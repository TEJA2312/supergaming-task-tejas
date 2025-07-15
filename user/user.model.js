const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: false,
  },
  refreshToken: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['admin', 'writer', 'reader'],
    default: 'reader'
  },
  loginAttempts: {
    type: Number,
    default: 0,
    required: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
