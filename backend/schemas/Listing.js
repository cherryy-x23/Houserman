const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    ownerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    heading: {
      type: String,
      required: [true, 'Heading is required'],
      trim: true,
      maxlength: 100,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['Flat', 'Independent House', 'Bungalow', 'Single Room'],
      required: true,
    },
    monthlyCost: {
      type: Number,
      required: true,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bedroomCount: {
      type: Number,
      required: true,
      min: 0,
    },
    bathroomCount: {
      type: Number,
      required: true,
      min: 0,
    },
    floorArea: {
      type: Number,
      required: true,
      min: 1,
    },
    furnishLevel: {
      type: String,
      enum: ['Fully Furnished', 'Partly Furnished', 'Not Furnished'],
      required: true,
    },
    readyFrom: {
      type: Date,
      required: true,
    },
    locationInfo: {
      addressLine: { type: String, required: true },
      area: String,
      town: { type: String, required: true },
      region: { type: String, required: true },
      pin: {
        type: String,
        required: true,
        match: /^[0-9]{6}$/,
      },
    },
    facilities: {
      internet: { type: Boolean, default: false },
      vehicleParking: { type: Boolean, default: false },
      generatorBackup: { type: Boolean, default: false },
      waterSupply24x7: { type: Boolean, default: false },
      airConditioned: { type: Boolean, default: false },
      guardSecurity: { type: Boolean, default: false },
      fitnessCenter: { type: Boolean, default: false },
      swimPool: { type: Boolean, default: false },
    },
    pictures: [
      {
        fileName: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    occupancyState: {
      type: String,
      enum: ['Open', 'Taken'],
      default: 'Open',
    },
    moderationState: {
      type: String,
      enum: ['Awaiting', 'Cleared', 'Declined'],
      default: 'Awaiting',
    },
    moderationNote: { type: String },
    hitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ 'locationInfo.town': 1, 'locationInfo.region': 1 });
listingSchema.index({ monthlyCost: 1, category: 1 });
listingSchema.index({ occupancyState: 1 });
listingSchema.index({ moderationState: 1 });

module.exports = mongoose.model('Listing', listingSchema);
