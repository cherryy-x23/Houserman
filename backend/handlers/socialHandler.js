const mongoose = require('mongoose');
const { Wishlist, ChatLine, Alert, Petition } = require('../schemas/extras');
const Listing = require('../schemas/Listing');
const Account = require('../schemas/Account');
const { ServiceError } = require('../guards/errorGuard');

const raiseAlert = async (io, data) => {
  try {
    const alert = await Alert.create(data);
    if (io) io.to(data.ownerRef.toString()).emit('fresh_alert', alert);
  } catch (e) { console.error('Alert error:', e.message); }
};

// ════════════════════════════════════════════
// WISHLIST
// ════════════════════════════════════════════

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const found = await Wishlist.findOne({ seekerRef: req.account.id, listingRef: listingId });
    if (found) {
      await found.deleteOne();
      return res.status(200).json({ ok: true, listed: false, msg: 'Removed from wishlist' });
    }
    await Wishlist.create({ seekerRef: req.account.id, listingRef: listingId });
    res.status(201).json({ ok: true, listed: true, msg: 'Added to wishlist' });
  } catch (e) { next(e); }
};

exports.fetchWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ seekerRef: req.account.id })
      .populate({ path: 'listingRef', populate: { path: 'ownerRef', select: 'fullName' } })
      .sort('-createdAt');
    res.status(200).json({ ok: true, items });
  } catch (e) { next(e); }
};

exports.checkWishlist = async (req, res, next) => {
  try {
    const found = await Wishlist.findOne({ seekerRef: req.account.id, listingRef: req.params.listingId });
    res.status(200).json({ ok: true, listed: !!found });
  } catch (e) { next(e); }
};

// ════════════════════════════════════════════
// PETITIONS (Rental Requests)
// ════════════════════════════════════════════

exports.makePetition = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId).populate('ownerRef', 'fullName');
    if (!listing) return next(new ServiceError('Listing not found', 404));
    if (listing.occupancyState !== 'Open') return next(new ServiceError('Listing is not open', 400));

    const found = await Petition.findOne({ listingRef: listing._id, seekerRef: req.account.id });
    if (found) return next(new ServiceError('You already sent a petition for this listing', 400));

    const petition = await Petition.create({
      listingRef: listing._id, seekerRef: req.account.id, ownerRef: listing.ownerRef._id,
      note: req.body.note, preferredMoveIn: req.body.preferredMoveIn, stayMonths: req.body.stayMonths,
    });

    const io = req.app.get('io');
    await raiseAlert(io, {
      ownerRef: listing.ownerRef._id,
      category: 'stay_request',
      heading: 'New Petition',
      body: `${req.account.fullName} sent a petition for "${listing.heading}"`,
      targetLink: '/console',
      refId: petition._id,
    });

    const populated = await petition.populate([
      { path: 'seekerRef', select: 'fullName emailAddress contactNumber avatarImage' },
      { path: 'listingRef', select: 'heading locationInfo monthlyCost pictures' },
    ]);

    res.status(201).json({ ok: true, petition: populated });
  } catch (e) { next(e); }
};

exports.fetchMyPetitions = async (req, res, next) => {
  try {
    const petitions = await Petition.find({ seekerRef: req.account.id })
      .populate('listingRef', 'heading locationInfo monthlyCost pictures occupancyState')
      .populate('ownerRef', 'fullName emailAddress contactNumber')
      .sort('-createdAt');
    res.status(200).json({ ok: true, petitions });
  } catch (e) { next(e); }
};

exports.fetchOwnerPetitions = async (req, res, next) => {
  try {
    const petitions = await Petition.find({ ownerRef: req.account.id })
      .populate('listingRef', 'heading locationInfo monthlyCost pictures')
      .populate('seekerRef', 'fullName emailAddress contactNumber avatarImage')
      .sort('-createdAt');
    res.status(200).json({ ok: true, petitions });
  } catch (e) { next(e); }
};

exports.changePetitionState = async (req, res, next) => {
  try {
    const { petitionState, declineNote } = req.body;
    const petition = await Petition.findById(req.params.id);
    if (!petition) return next(new ServiceError('Petition not found', 404));
    if (petition.ownerRef.toString() !== req.account.id) return next(new ServiceError('Not allowed', 403));

    petition.petitionState = petitionState;
    if (petitionState === 'Declined' && declineNote) petition.declineNote = declineNote;
    if (petitionState === 'Accepted') await Listing.findByIdAndUpdate(petition.listingRef, { occupancyState: 'Taken' });
    await petition.save();

    const listing = await Listing.findById(petition.listingRef);
    const io = req.app.get('io');
    await raiseAlert(io, {
      ownerRef: petition.seekerRef,
      category: petitionState === 'Accepted' ? 'stay_accepted' : 'stay_declined',
      heading: `Petition ${petitionState}`,
      body: petitionState === 'Accepted'
        ? `Your petition for "${listing?.heading}" was accepted!`
        : `Your petition for "${listing?.heading}" was declined.`,
      targetLink: '/console',
      refId: petition._id,
    });

    res.status(200).json({ ok: true, petition });
  } catch (e) { next(e); }
};

// ════════════════════════════════════════════
// CHAT
// ════════════════════════════════════════════

exports.sendChatLine = async (req, res, next) => {
  try {
    const { toUser, text, threadTag } = req.body;
    if (!toUser || !text || !threadTag) return next(new ServiceError('toUser, text and threadTag are required', 400));

    const receiver = await Account.findById(toUser);
    if (!receiver) return next(new ServiceError('Receiver not found', 404));

    const line = await ChatLine.create({ threadTag, fromUser: req.account.id, toUser, text });
    const populated = await line.populate('fromUser', 'fullName avatarImage');

    const io = req.app.get('io');
    await raiseAlert(io, {
      ownerRef: toUser,
      category: 'chat_line',
      heading: 'New Message',
      body: `${req.account.fullName} sent you a message`,
      targetLink: `/conversations/${threadTag}`,
      refId: line._id,
    });

    if (io) io.to(threadTag).emit('chat_line_arrived', populated);

    res.status(201).json({ ok: true, line: populated });
  } catch (e) { next(e); }
};

exports.fetchChatLines = async (req, res, next) => {
  try {
    const { threadTag } = req.params;
    const lines = await ChatLine.find({ threadTag })
      .populate('fromUser', 'fullName avatarImage')
      .sort('createdAt');
    await ChatLine.updateMany(
      { threadTag, toUser: req.account.id, seen: false },
      { seen: true, seenAt: new Date() }
    );
    res.status(200).json({ ok: true, lines });
  } catch (e) { next(e); }
};

exports.fetchThreads = async (req, res, next) => {
  try {
    const accountId = new mongoose.Types.ObjectId(req.account.id);
    const threads = await ChatLine.aggregate([
      { $match: { $or: [{ fromUser: accountId }, { toUser: accountId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$threadTag',
          lastLine: { $first: '$$ROOT' },
          unseenCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$toUser', accountId] }, { $eq: ['$seen', false] }] }, 1, 0] },
          },
        },
      },
      { $sort: { 'lastLine.createdAt': -1 } },
    ]);

    const populated = await Promise.all(
      threads.map(async (t) => {
        const fromId = t.lastLine.fromUser.toString();
        const otherId = fromId === req.account.id ? t.lastLine.toUser : t.lastLine.fromUser;
        const otherAccount = await Account.findById(otherId).select('fullName emailAddress avatarImage accountType');
        return { ...t, otherAccount };
      })
    );

    res.status(200).json({ ok: true, threads: populated });
  } catch (e) { next(e); }
};

// ════════════════════════════════════════════
// ALERTS
// ════════════════════════════════════════════

exports.fetchAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ ownerRef: req.account.id }).sort('-createdAt').limit(50);
    const unseenCount = await Alert.countDocuments({ ownerRef: req.account.id, seen: false });
    res.status(200).json({ ok: true, alerts, unseenCount });
  } catch (e) { next(e); }
};

exports.clearAlerts = async (req, res, next) => {
  try {
    await Alert.updateMany({ ownerRef: req.account.id, seen: false }, { seen: true });
    res.status(200).json({ ok: true, msg: 'All alerts cleared' });
  } catch (e) { next(e); }
};
