const Account = require('../schemas/Account');
const Listing = require('../schemas/Listing');
const { Petition, Stay } = require('../schemas/extras');
const { ServiceError } = require('../guards/errorGuard');
const { removeStoredFile } = require('../configs/fileStorage');

// ════════════════════════════════════════════
// ACCOUNT
// ════════════════════════════════════════════

exports.editProfile = async (req, res, next) => {
  try {
    const { fullName, contactNumber, aboutMe, residingAt } = req.body;
    const patch = { fullName, contactNumber, aboutMe };
    if (residingAt) patch.residingAt = typeof residingAt === 'string' ? JSON.parse(residingAt) : residingAt;

    if (req.file) {
      const account = await Account.findById(req.account.id);
      if (account.avatarImage?.fileName) removeStoredFile(account.avatarImage.fileName);
      patch.avatarImage = {
        fileName: req.file.filename,
        url: req.file.path && req.file.path.startsWith('http') ? req.file.path : `http://localhost:${process.env.PORT}/assets_uploaded/${req.file.filename}`,
      };
    }

    const account = await Account.findByIdAndUpdate(req.account.id, patch, { new: true, runValidators: true });
    res.status(200).json({ ok: true, account });
  } catch (e) { next(e); }
};

exports.fetchAccountById = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id).select('-passwordHash');
    if (!account) return next(new ServiceError('Account not found', 404));
    res.status(200).json({ ok: true, account });
  } catch (e) { next(e); }
};

exports.ownerConsole = async (req, res, next) => {
  try {
    const ownerId = req.account.id;
    const [listings, petitions, stays] = await Promise.all([
      Listing.find({ ownerRef: ownerId }),
      Petition.find({ ownerRef: ownerId }).populate('seekerRef', 'fullName emailAddress').populate('listingRef', 'heading'),
      Stay.find({ ownerRef: ownerId }),
    ]);

    const figures = {
      totalListings: listings.length,
      openListings: listings.filter((l) => l.occupancyState === 'Open').length,
      takenListings: listings.filter((l) => l.occupancyState === 'Taken').length,
      totalPetitions: petitions.length,
      awaitingPetitions: petitions.filter((p) => p.petitionState === 'Awaiting').length,
      totalStays: stays.length,
      totalHits: listings.reduce((sum, l) => sum + (l.hitCount || 0), 0),
    };

    res.status(200).json({ ok: true, figures, listings, petitions });
  } catch (e) { next(e); }
};

exports.seekerConsole = async (req, res, next) => {
  try {
    const seekerId = req.account.id;
    const [petitions, wishlistItems] = await Promise.all([
      Petition.find({ seekerRef: seekerId })
        .populate('listingRef', 'heading locationInfo monthlyCost pictures')
        .populate('ownerRef', 'fullName contactNumber')
        .sort('-createdAt'),
      require('../schemas/extras').Wishlist.find({ seekerRef: seekerId })
        .populate('listingRef', 'heading locationInfo monthlyCost pictures occupancyState')
        .sort('-createdAt')
        .limit(6),
    ]);

    const figures = {
      totalPetitions: petitions.length,
      awaitingPetitions: petitions.filter((p) => p.petitionState === 'Awaiting').length,
      acceptedPetitions: petitions.filter((p) => p.petitionState === 'Accepted').length,
      savedListings: wishlistItems.length,
    };

    res.status(200).json({ ok: true, figures, petitions, wishlistItems });
  } catch (e) { next(e); }
};

// ════════════════════════════════════════════
// MANAGER (Admin)
// ════════════════════════════════════════════

exports.managerFigures = async (req, res, next) => {
  try {
    const [accounts, listings, petitionsTotal] = await Promise.all([
      Account.aggregate([{ $group: { _id: '$accountType', count: { $sum: 1 } } }]),
      Listing.aggregate([{ $group: { _id: '$occupancyState', count: { $sum: 1 } } }]),
      Petition.countDocuments(),
    ]);

    const accountFigures = { total: 0, seekers: 0, owners: 0, managers: 0 };
    accounts.forEach(({ _id, count }) => {
      accountFigures.total += count;
      if (_id === 'seeker') accountFigures.seekers = count;
      if (_id === 'owner') accountFigures.owners = count;
      if (_id === 'manager') accountFigures.managers = count;
    });

    const listingFigures = { total: 0, open: 0, taken: 0 };
    listings.forEach(({ _id, count }) => {
      listingFigures.total += count;
      if (_id === 'Open') listingFigures.open = count;
      if (_id === 'Taken') listingFigures.taken = count;
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyAccounts = await Account.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      ok: true,
      figures: { accounts: accountFigures, listings: listingFigures, totalPetitions: petitionsTotal, monthlyAccounts },
    });
  } catch (e) { next(e); }
};

exports.managerAccountList = async (req, res, next) => {
  try {
    const { page = 1, count = 20, accountType, search } = req.query;
    const filter = {};
    if (accountType) filter.accountType = accountType;
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { emailAddress: { $regex: search, $options: 'i' } },
    ];
    const total = await Account.countDocuments(filter);
    const accounts = await Account.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * count)
      .limit(Number(count));
    res.status(200).json({ ok: true, accounts, total, pageCount: Math.ceil(total / count) });
  } catch (e) { next(e); }
};

exports.toggleSuspend = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return next(new ServiceError('Account not found', 404));
    if (account.accountType === 'manager') return next(new ServiceError('Cannot suspend a manager', 403));
    account.suspended = !account.suspended;
    await account.save({ validateBeforeSave: false });
    res.status(200).json({ ok: true, msg: `Account ${account.suspended ? 'suspended' : 'reinstated'}`, account });
  } catch (e) { next(e); }
};

exports.managerRemoveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return next(new ServiceError('Listing not found', 404));
    res.status(200).json({ ok: true, msg: 'Listing removed by manager' });
  } catch (e) { next(e); }
};
