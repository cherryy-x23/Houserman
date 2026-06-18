const { Stay, Alert } = require('../schemas/extras');
const Listing = require('../schemas/Listing');
const { ServiceError } = require('../guards/errorGuard');

const raiseAlert = async (io, data) => {
  try {
    const alert = await Alert.create(data);
    if (io) io.to(data.ownerRef.toString()).emit('fresh_alert', alert);
  } catch (e) { console.error('Alert error:', e.message); }
};

exports.makeStay = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return next(new ServiceError('Listing not found', 404));
    if (listing.moderationState !== 'Cleared') return next(new ServiceError('Listing not yet cleared', 400));
    if (listing.occupancyState !== 'Open') return next(new ServiceError('Listing is not open', 400));

    const { moveInOn, moveOutOn, noteToOwner } = req.body;
    const start = new Date(moveInOn);
    const end = new Date(moveOutOn);
    const monthsCount = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
    const payableAmount = monthsCount * listing.monthlyCost;

    const exists = await Stay.findOne({
      listingRef: listing._id, seekerRef: req.account.id,
      stayState: { $in: ['Awaiting', 'Accepted'] },
    });
    if (exists) return next(new ServiceError('You already have an active stay request', 400));

    const stay = await Stay.create({
      listingRef: listing._id, seekerRef: req.account.id, ownerRef: listing.ownerRef,
      moveInOn: start, moveOutOn: end, monthsCount, payableAmount, noteToOwner,
    });

    const io = req.app.get('io');
    await raiseAlert(io, {
      ownerRef: listing.ownerRef,
      category: 'stay_request',
      heading: 'New Stay Request',
      body: `${req.account.fullName} requested to stay at "${listing.heading}"`,
      targetLink: '/console',
      refId: stay._id,
    });

    const populated = await stay.populate([
      { path: 'listingRef', select: 'heading locationInfo monthlyCost pictures' },
      { path: 'seekerRef', select: 'fullName emailAddress contactNumber' },
    ]);

    res.status(201).json({ ok: true, stay: populated });
  } catch (e) { next(e); }
};

exports.fetchMyStays = async (req, res, next) => {
  try {
    const stays = await Stay.find({ seekerRef: req.account.id })
      .populate('listingRef', 'heading locationInfo monthlyCost pictures occupancyState')
      .populate('ownerRef', 'fullName emailAddress contactNumber avatarImage')
      .sort('-createdAt');
    res.status(200).json({ ok: true, stays });
  } catch (e) { next(e); }
};

exports.fetchOwnerStays = async (req, res, next) => {
  try {
    const stays = await Stay.find({ ownerRef: req.account.id })
      .populate('listingRef', 'heading locationInfo monthlyCost pictures')
      .populate('seekerRef', 'fullName emailAddress contactNumber avatarImage')
      .sort('-createdAt');
    res.status(200).json({ ok: true, stays });
  } catch (e) { next(e); }
};

exports.changeStayState = async (req, res, next) => {
  try {
    const { stayState, declineReason } = req.body;
    const stay = await Stay.findById(req.params.id);
    if (!stay) return next(new ServiceError('Stay not found', 404));
    if (stay.ownerRef.toString() !== req.account.id && req.account.accountType !== 'manager') {
      return next(new ServiceError('Not allowed', 403));
    }
    stay.stayState = stayState;
    if (declineReason) stay.declineReason = declineReason;
    if (stayState === 'Accepted') await Listing.findByIdAndUpdate(stay.listingRef, { occupancyState: 'Taken' });
    if (stayState === 'Declined' || stayState === 'Closed') {
      await Listing.findByIdAndUpdate(stay.listingRef, { occupancyState: 'Open' });
    }
    await stay.save();

    const io = req.app.get('io');
    await raiseAlert(io, {
      ownerRef: stay.seekerRef,
      category: stayState === 'Accepted' ? 'stay_accepted' : 'stay_declined',
      heading: `Stay ${stayState}`,
      body: `Your stay request has been ${stayState.toLowerCase()}`,
      targetLink: '/console',
      refId: stay._id,
    });

    res.status(200).json({ ok: true, stay });
  } catch (e) { next(e); }
};

exports.dropStay = async (req, res, next) => {
  try {
    const stay = await Stay.findById(req.params.id);
    if (!stay) return next(new ServiceError('Stay not found', 404));
    if (stay.seekerRef.toString() !== req.account.id) return next(new ServiceError('Not allowed', 403));
    stay.stayState = 'Closed';
    stay.declineReason = req.body.declineReason || 'Cancelled by seeker';
    await stay.save();
    await Listing.findByIdAndUpdate(stay.listingRef, { occupancyState: 'Open' });
    res.status(200).json({ ok: true, stay });
  } catch (e) { next(e); }
};
