const mongoose = require('mongoose');

// ─── Stay (Booking) ──────────────────────────────────────────────────────────
const staySchema = new mongoose.Schema(
  {
    listingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    seekerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    ownerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    moveInOn: { type: Date, required: true },
    moveOutOn: { type: Date, required: true },
    monthsCount: { type: Number, required: true },
    payableAmount: { type: Number, required: true },
    stayState: {
      type: String,
      enum: ['Awaiting', 'Accepted', 'Declined', 'Closed'],
      default: 'Awaiting',
    },
    noteToOwner: { type: String, maxlength: 500 },
    declineReason: { type: String },
  },
  { timestamps: true }
);

// ─── Wishlist (Favorite) ──────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema(
  {
    seekerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    listingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  },
  { timestamps: true }
);
wishlistSchema.index({ seekerRef: 1, listingRef: 1 }, { unique: true });

// ─── ChatLine (Message) ────────────────────────────────────────────────────────
const chatLineSchema = new mongoose.Schema(
  {
    threadTag: { type: String, required: true, index: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date },
  },
  { timestamps: true }
);

// ─── Alert (Notification) ──────────────────────────────────────────────────────
const alertSchema = new mongoose.Schema(
  {
    ownerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    category: {
      type: String,
      enum: ['stay_request', 'stay_accepted', 'stay_declined', 'chat_line', 'general_alert'],
      required: true,
    },
    heading: { type: String, required: true },
    body: { type: String, required: true },
    targetLink: { type: String },
    seen: { type: Boolean, default: false },
    refId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);
alertSchema.index({ ownerRef: 1, seen: 1 });

// ─── Petition (Rental Request) ─────────────────────────────────────────────────
const petitionSchema = new mongoose.Schema(
  {
    listingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    seekerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    ownerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    petitionState: {
      type: String,
      enum: ['Awaiting', 'Accepted', 'Declined'],
      default: 'Awaiting',
    },
    note: { type: String, maxlength: 500 },
    preferredMoveIn: { type: Date },
    stayMonths: { type: Number },
    declineNote: { type: String },
  },
  { timestamps: true }
);
petitionSchema.index({ seekerRef: 1, listingRef: 1 }, { unique: true });

module.exports = {
  Stay: mongoose.model('Stay', staySchema),
  Wishlist: mongoose.model('Wishlist', wishlistSchema),
  ChatLine: mongoose.model('ChatLine', chatLineSchema),
  Alert: mongoose.model('Alert', alertSchema),
  Petition: mongoose.model('Petition', petitionSchema),
};
