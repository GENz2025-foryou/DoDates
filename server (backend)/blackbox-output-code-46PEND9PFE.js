const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true },
  mobile: { type: String, unique: true, sparse: true },
  password: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  age: { type: Number, min: 18, max: 100 },
  bio: { type: String, maxlength: 500 },
  photos: [{ url: String, isVerified: { type: Boolean, default: false } }],
  interests: [String],
  preferences: {
    gender: [String],
    ageRange: { min: Number, max: Number },
    distance: { type: Number, default: 50 }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  isVerified: { type: Boolean, default: false },
  faceVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false },
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAdmin: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);