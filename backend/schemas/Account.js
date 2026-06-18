const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const accountSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 60,
    },
    emailAddress: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    accountType: {
      type: String,
      enum: ['seeker', 'owner', 'manager'],
      default: 'seeker',
    },
    contactNumber: {
      type: String,
      match: [/^[0-9]{10}$/, 'Enter a valid 10 digit number'],
    },
    avatarImage: {
      fileName: String,
      url: { type: String, default: '' },
    },
    aboutMe: { type: String, maxlength: 500 },
    residingAt: {
      area: String,
      town: String,
      region: String,
      pin: String,
    },
    suspended: { type: Boolean, default: false },
    passcodeResetToken: String,
    passcodeResetExpiry: Date,
    lastSeen: Date,
  },
  { timestamps: true }
);

accountSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

accountSchema.methods.verifyPassword = async function (raw) {
  return bcrypt.compare(raw, this.passwordHash);
};

accountSchema.methods.issueToken = function () {
  return jwt.sign({ id: this._id, accountType: this.accountType }, process.env.SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRY || '30d',
  });
};

accountSchema.methods.generateResetCode = function () {
  const code = crypto.randomBytes(20).toString('hex');
  this.passcodeResetToken = crypto.createHash('sha256').update(code).digest('hex');
  this.passcodeResetExpiry = Date.now() + 10 * 60 * 1000;
  return code;
};

module.exports = mongoose.model('Account', accountSchema);
